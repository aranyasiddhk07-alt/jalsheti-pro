import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Exponential backoff: 1, 4, 16 seconds
function getNextRetry(attempts: number): number {
  return Math.pow(2, attempts * 2); // 2^(2*n) -> 1, 4, 16
}

async function processWatiSend(job: any): Promise<void> {
  const { phone, template, params } = job.payload;
  const watiToken = Deno.env.get("WATI_API_TOKEN");
  const watiEndpoint = Deno.env.get("WATI_API_ENDPOINT") || "https://live-mt-server.wati.io/300001/api";
  if (!watiToken) throw new Error("WATI_API_TOKEN not configured");

  const res = await fetch(`${watiEndpoint}/v1/sendTemplateMessage?whatsappNumber=${phone}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${watiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_name: template,
      broadcast_name: `retry_${phone}_${Date.now()}`,
      parameters: params || [],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WATI failed: ${res.status} ${txt}`);
  }
}

async function processPushNotification(job: any): Promise<void> {
  // Stub for push notification via OneSignal or similar
  console.log("Push notification: ", job.payload);
}

async function processCommissionCredit(job: any): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { supplier_id, amount } = job.payload;
  // Mark a pending commission as credited
  await supabase
    .from("commission_wallet")
    .update({ status: "credited", credited_at: new Date().toISOString() })
    .eq("supplier_id", supplier_id)
    .eq("status", "pending")
    .eq("amount", amount);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");
  if (!expectedSecret || cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Pick up pending jobs (next_retry_at <= now)
  const { data: jobs, error: fetchErr } = await supabase
    .from("job_queue")
    .select("*")
    .eq("status", "pending")
    .lte("next_retry_at", new Date().toISOString())
    .or("next_retry_at.is.null")
    .order("created_at", { ascending: true })
    .limit(50);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = [];
  for (const job of jobs || []) {
    try {
      switch (job.job_type) {
        case "wati_send":
          await processWatiSend(job);
          break;
        case "push_notification":
          await processPushNotification(job);
          break;
        case "commission_credit":
          await processCommissionCredit(job);
          break;
        default:
          console.warn(`Unknown job type: ${job.job_type}`);
      }

      // Mark completed
      await supabase
        .from("job_queue")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", job.id);

      results.push({ id: job.id, status: "completed" });
    } catch (err) {
      const attempts = (job.attempts || 0) + 1;
      const maxAttempts = job.max_attempts || 3;

      if (attempts >= maxAttempts) {
        await supabase
          .from("job_queue")
          .update({ status: "dead", attempts, last_error: err.message })
          .eq("id", job.id);
        results.push({ id: job.id, status: "dead", error: err.message });
      } else {
        const nextRetry = new Date(Date.now() + getNextRetry(attempts) * 1000).toISOString();
        await supabase
          .from("job_queue")
          .update({ attempts, next_retry_at: nextRetry, last_error: err.message, status: "pending" })
          .eq("id", job.id);
        results.push({ id: job.id, status: "retrying", nextRetry });
      }
    }
  }

  return new Response(JSON.stringify({ success: true, processed: results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

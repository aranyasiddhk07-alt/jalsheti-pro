import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sendWati(phone: string, templateName: string, params: { name: string; value: string }[]) {
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
      template_name: templateName,
      broadcast_name: `morning_${phone}_${Date.now()}`,
      parameters: params,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WATI send failed: ${res.status} ${txt}`);
  }
  return res.json();
}

serve(async (req) => {
  // Cron job invocation (no CORS handling needed but adding for safety)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Optional: check for secret in header to prevent unauthorized invocations
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");
  if (!expectedSecret || cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch all active consumers with fields (growth stage)
  const { data: consumers, error: consErr } = await supabase
    .from("consumers")
    .select("id, name, phone, fields(id, crop_name, crop_day, taluka, district)")
    .eq("subscription_status", "active")
    .not("phone", "is", null);

  if (consErr || !consumers) {
    return new Response(JSON.stringify({ error: "Failed to fetch consumers", detail: consErr }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = [];
  const batchSize = 50;
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < consumers.length; i += batchSize) {
    const batch = consumers.slice(i, i + batchSize);

    for (const consumer of batch) {
      try {
        // Simplified message with growth info
        const field = consumer.fields?.[0]; // primary field
        const day = field?.crop_day || 0;
        const crop = field?.crop_name || "à¤ªà¥€à¤•";
        const params = [
          { name: "farmer_name", value: consumer.name || "à¤¶à¥‡à¤¤à¤•à¤°à¥€" },
          { name: "crop_name", value: crop },
          { name: "day", value: day.toString() },
        ];

        try {
          await sendWati(consumer.phone, "morning_advisory", params);
          results.push({ consumer: consumer.id, status: "sent" });
        } catch (err) {
          // Write to job_queue for retry
          await supabase.from("job_queue").insert({
            job_type: "wati_send",
            payload: {
              phone: consumer.phone,
              template: "morning_advisory",
              params,
              consumer_id: consumer.id,
            },
            status: "pending",
            max_attempts: 3,
            created_at: new Date().toISOString(),
          });
          results.push({ consumer: consumer.id, status: "queued", error: err.message });
        }
      } catch (err) {
        results.push({ consumer: consumer.id, status: "error", error: err.message });
      }
    }

    if (i + batchSize < consumers.length) {
      await delay(1000); // 1 second between batches
    }
  }

  return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

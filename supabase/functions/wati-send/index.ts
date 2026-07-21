import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALLOWED_TEMPLATES = new Set([
  "morning_advisory",
  "pest_alert",
  "water_schedule",
  "savings_event",
  "fertilizer_window",
  "payment_reminder",
  "general_broadcast",
]);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!checkRateLimit(user.id)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone, templateName, parameters } = await req.json();

    if (!ALLOWED_TEMPLATES.has(templateName)) {
      throw new Error(`Template '${templateName}' is not allowed`);
    }

    const watiToken = Deno.env.get("WATI_API_TOKEN");
    const watiEndpoint = Deno.env.get("WATI_API_ENDPOINT") || "https://live-mt-server.wati.io/300001/api";
    if (!watiToken) throw new Error("WATI_API_TOKEN not configured");

    const payload = {
      template_name: templateName,
      broadcast_name: `jalsheti_${templateName}_${Date.now()}`,
      parameters: parameters.map((p: { name: string; value: string }) => ({
        name: p.name,
        value: p.value,
      })),
    };

    const watiResponse = await fetch(`${watiEndpoint}/v1/sendTemplateMessage?whatsappNumber=${phone}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${watiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!watiResponse.ok) {
      const errText = await watiResponse.text();
      throw new Error(`WATI error: ${watiResponse.status} ${errText}`);
    }

    const result = await watiResponse.json();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";

const COMMISSION_RATES: Record<string, number> = {
  basic: 20,
  smart: 40,
  premium: 60,
};

interface RazorpayPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        status: string;
        notes?: Record<string, string>;
      };
    };
    subscription?: {
      entity: {
        id: string;
      };
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("x-razorpay-signature");
  const body = await req.text();

  // Verify signature
  try {
    const expectedSignature = createHmac("sha256", webhookSecret).update(body).digest("hex");
    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ verified: false, error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ verified: false, error: "Webhook secret not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload: RazorpayPayload = JSON.parse(body);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const subscriptionId = payload.payload.subscription?.entity.id;

    if (subscriptionId) {
      // 1. Match subscription
      const { data: sub, error: subErr } = await supabase
        .from("subscriptions")
        .select("id, plan_type, consumer_id, supplier_id, status")
        .eq("razorpay_subscription_id", subscriptionId)
        .single();

      if (subErr || !sub) {
        console.error("Subscription not found:", subscriptionId, subErr);
        return new Response(JSON.stringify({ verified: true, status: "subscription_not_found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const planType = sub.plan_type || "basic";
      const commission = COMMISSION_RATES[planType] || 20;
      const now = new Date().toISOString();

      // 2. Update subscription status
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          next_billing_at: nextBilling.toISOString(),
          updated_at: now,
        })
        .eq("id", sub.id);

      // 3. Insert commission
      const { error: commErr } = await supabase.from("commission_wallet").insert({
        supplier_id: sub.supplier_id,
        consumer_id: sub.consumer_id,
        amount: commission,
        transaction_type: "consumer_commission",
        status: "pending",
        meta: { payment_id: payment.id, subscription_id: subscriptionId },
        created_at: now,
      });

      if (commErr) console.error("Commission insertion failed:", commErr);

      // 4. Update consumer subscription_status
      await supabase
        .from("consumers")
        .update({ subscription_status: "active" })
        .eq("id", sub.consumer_id);

      // 5. Enqueue job for supplier notification
      await supabase.from("job_queue").insert({
        job_type: "wati_send",
        payload: {
          supplier_id: sub.supplier_id,
          template: "payment_success",
          params: { consumer_id: sub.consumer_id, amount: payment.amount / 100 },
        },
        status: "pending",
        created_at: now,
      });
    }

    return new Response(JSON.stringify({ verified: true, status: "processed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ verified: true, status: "ignored" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

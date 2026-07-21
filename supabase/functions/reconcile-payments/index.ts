import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = btoa(`${razorpayKey}:${razorpaySecret}`);

    const yesterday = new Date(Date.now() - 86400000);
    const from = Math.floor(yesterday.getTime() / 1000);
    const to = Math.floor(Date.now() / 1000);

    let allPayments: any[] = [];
    let skip = 0;
    const count = 100;

    while (true) {
      const rpRes = await fetch(
        `https://api.razorpay.com/v1/payments?from=${from}&to=${to}&count=${count}&skip=${skip}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const rpData = await rpRes.json();
      if (!rpRes.ok) throw new Error(`Razorpay API error: ${JSON.stringify(rpData)}`);
      const items = rpData.items || [];
      allPayments = allPayments.concat(items);
      if (items.length < count) break;
      skip += count;
    }

    let discrepancies = 0;
    for (const payment of allPayments) {
      if (payment.status !== "captured") continue;
      const subId = payment.notes?.subscription_id || payment.subscription_id;
      if (!subId) continue;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, status, amount")
        .eq("razorpay_subscription_id", subId)
        .single();

      if (!sub) {
        await supabase.from("audit_log").insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          action: "payment_reconciled_missing_subscription",
          table_name: "subscriptions",
          record_id: null,
          new_values: { razorpay_payment_id: payment.id, subscription_id: subId, amount: payment.amount },
        });
        discrepancies++;
        continue;
      }

      if (sub.status !== "active") {
        await supabase.from("audit_log").insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          action: "payment_reconciled_mismatch",
          table_name: "subscriptions",
          record_id: sub.id,
          old_values: { status: sub.status },
          new_values: { razorpay_status: "captured", expected_status: "active" },
        });
        discrepancies++;
      }

      const paymentAmountPaise = payment.amount;
      const subAmountPaise = sub.amount;
      if (paymentAmountPaise !== subAmountPaise) {
        await supabase.from("audit_log").insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          action: "payment_amount_mismatch",
          table_name: "subscriptions",
          record_id: sub.id,
          old_values: { db_amount: subAmountPaise },
          new_values: { razorpay_amount: paymentAmountPaise },
        });
        discrepancies++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      paymentsChecked: allPayments.length,
      discrepancies,
      from: new Date(from * 1000).toISOString(),
      to: new Date(to * 1000).toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { supabase } from "../lib/supabase";
import type { Subscription, PlanType } from "../types";

async function getCurrentSubscription(
  consumerId: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as Subscription | null;
}

async function createSubscription(
  consumerId: string,
  planType: PlanType,
  amount: number,
  razorpaySubscriptionId: string,
  razorpayCustomerId: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      consumer_id: consumerId,
      plan_type: planType,
      amount,
      razorpay_subscription_id: razorpaySubscriptionId,
      razorpay_customer_id: razorpayCustomerId,
      status: "pending_first_debit",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Subscription;
}

async function checkTrialStatus(consumerId: string): Promise<{
  isTrialActive: boolean;
  daysRemaining: number;
}> {
  const { data: user, error } = await supabase
    .from("users")
    .select("subscription_status, trial_ends_at")
    .eq("id", consumerId)
    .single();

  if (error) throw new Error(error.message);

  const trialEnd = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const now = new Date();
  const isTrialActive = user?.subscription_status === "trial" && trialEnd && trialEnd > now;
  const daysRemaining = isTrialActive
    ? Math.ceil((trialEnd!.getTime() - now.getTime()) / 86400000)
    : 0;

  return { isTrialActive: !!isTrialActive, daysRemaining };
}

export const paymentService = {
  getCurrentSubscription,
  createSubscription,
  checkTrialStatus,
};

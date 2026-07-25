import { supabase } from "../lib/supabase";
import type { MarketRate, AuditLog } from "../types";

async function getPendingPayouts(): Promise<
  { id: string; supplier_id: string; amount: number; created_at: string; supplier_name: string }[]
> {
  const { data, error } = await supabase
    .from("commission_wallet")
    .select("id, supplier_id, amount, created_at, users!supplier_id(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const payouts = (data ?? []).map((item: Record<string, unknown>) => {
    const user = (item.users as unknown as { name: string }) || { name: "Unknown" };
    return {
      id: item.id as string,
      supplier_id: item.supplier_id as string,
      amount: item.amount as number,
      created_at: item.created_at as string,
      supplier_name: user.name,
    };
  });
  return payouts;
}

async function approvePayout(
  payoutId: string,
  adminId: string,
): Promise<void> {
  const { error } = await supabase
    .from("commission_wallet")
    .update({
      status: "approved",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq("id", payoutId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "payout_approved",
    table_name: "commission_wallet",
    record_id: payoutId,
  });
}

async function rejectPayout(
  payoutId: string,
  adminId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from("commission_wallet")
    .update({
      status: "rejected",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      notes: reason,
    })
    .eq("id", payoutId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "payout_rejected",
    table_name: "commission_wallet",
    record_id: payoutId,
    new_values: { reason },
  });
}

async function getMarketRates(district: string): Promise<MarketRate[]> {
  const { data, error } = await supabase
    .from("market_rates")
    .select("*")
    .eq("district", district)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MarketRate[];
}

async function updateMarketRate(
  adminId: string,
  district: string,
  updates: {
    factory_name?: string;
    frp_rate?: number;
    factory_opening_date?: string;
    sugar_recovery_rate?: number;
    notes_marathi?: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("market_rates")
    .upsert({
      district,
      ...updates,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "market_rate_updated",
    table_name: "market_rates",
    new_values: { district, ...updates },
  });
}

async function sendBroadcast(
  adminId: string,
  message: string,
  target: "all" | "consumers" | "suppliers" | "district",
  district?: string,
): Promise<{ sent: number }> {
  const { data, error } = await supabase.functions.invoke("broadcast-message", {
    body: { message, target, district },
  });

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "broadcast_sent",
    table_name: "notifications",
    new_values: { message, target, district },
  });

  return { sent: (data as Record<string, unknown>)?.sent as number ?? 0 };
}

async function getAuditLog(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AuditLog[];
}

async function getPlatformMetrics(): Promise<{
  activeConsumers: number;
  activeSuppliers: number;
  activeTrials: number;
  mrr: number;
}> {
  const { count: activeConsumers, error: e1 } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "consumer")
    .eq("subscription_status", "active");

  const { count: activeSuppliers, error: e2 } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "supplier")
    .eq("is_active", true);

  const { count: activeTrials, error: e3 } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "consumer")
    .eq("subscription_status", "trial");

  if (e1 || e2 || e3) throw new Error("Failed to fetch metrics");

  const mrr = (activeConsumers ?? 0) * 99;

  return {
    activeConsumers: activeConsumers ?? 0,
    activeSuppliers: activeSuppliers ?? 0,
    activeTrials: activeTrials ?? 0,
    mrr,
  };
}

export const adminService = {
  getPendingPayouts,
  approvePayout,
  rejectPayout,
  getMarketRates,
  updateMarketRate,
  sendBroadcast,
  getAuditLog,
  getPlatformMetrics,
};

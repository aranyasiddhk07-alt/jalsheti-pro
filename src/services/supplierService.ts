import { supabase } from "../lib/supabase";
import type { User, WaterSchedule, CommissionWallet, SupplierReferral } from "../types";

async function getLinkedConsumers(supplierId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("linked_supplier_id", supplierId)
    .eq("role", "consumer")
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as User[];
}

async function getCommissionWallet(supplierId: string): Promise<CommissionWallet[]> {
  const { data, error } = await supabase
    .from("commission_wallet")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CommissionWallet[];
}

async function getPendingPayoutAmount(supplierId: string): Promise<number> {
  const { data, error } = await supabase
    .from("commission_wallet")
    .select("amount")
    .eq("supplier_id", supplierId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + (row.amount as number), 0);
}

async function requestPayout(supplierId: string, amount: number): Promise<void> {
  const { error } = await supabase.functions.invoke("request-payout", {
    body: { supplierId, amount },
  });

  if (error) throw new Error(error.message);
}

async function createWaterSchedule(
  supplierId: string,
  consumerId: string,
  fieldId: string,
  scheduledDate: string,
  plannedStartTime: string,
  plannedEndTime: string,
  notes?: string,
): Promise<WaterSchedule | null> {
  const { data, error } = await supabase
    .from("water_schedules")
    .insert({
      supplier_id: supplierId,
      consumer_id: consumerId,
      field_id: fieldId,
      scheduled_date: scheduledDate,
      planned_start_time: plannedStartTime,
      planned_end_time: plannedEndTime,
      notes,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as WaterSchedule;
}

async function getUpcomingSchedules(
  supplierId: string,
  limit = 10,
): Promise<WaterSchedule[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("water_schedules")
    .select("*")
    .eq("supplier_id", supplierId)
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WaterSchedule[];
}

async function getReferrals(supplierId: string): Promise<SupplierReferral[]> {
  const { data, error } = await supabase
    .from("supplier_referrals")
    .select("*")
    .eq("referrer_supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SupplierReferral[];
}

function subscribeToWaterSessions(
  supplierId: string,
  callback: (payload: Record<string, unknown>) => void,
) {
  const channel = supabase
    .channel(`supplier-water:${supplierId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "water_sessions",
        filter: `supplier_id=eq.${supplierId}`,
      },
      callback,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const supplierService = {
  getLinkedConsumers,
  getCommissionWallet,
  getPendingPayoutAmount,
  requestPayout,
  createWaterSchedule,
  getUpcomingSchedules,
  getReferrals,
  subscribeToWaterSessions,
};

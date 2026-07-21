import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  return profile;
}

export async function getField(consumerId: string) {
  const { data } = await supabase
    .from("fields")
    .select("*")
    .eq("consumer_id", consumerId)
    .eq("is_active", true)
    .single();
  return data;
}

export async function getActiveWaterSession(fieldId: string) {
  const { data } = await supabase
    .from("water_sessions")
    .select("*")
    .eq("field_id", fieldId)
    .eq("status", "started")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getWaterSessions(fieldId: string, limit = 20) {
  const { data } = await supabase
    .from("water_sessions")
    .select("*")
    .eq("field_id", fieldId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data;
}

export async function getNotifications(userId: string, limit = 50) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data;
}

export async function getUnreadNotificationCount(userId: string) {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("to_user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function getPestAlerts(fieldId: string) {
  const { data } = await supabase
    .from("pest_alerts")
    .select("*")
    .eq("field_id", fieldId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data;
}

export async function getCropAdvisories(consumerId: string, limit = 10) {
  const { data } = await supabase
    .from("crop_advisories")
    .select("*")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data;
}

export async function getSavingsTotal(consumerId: string) {
  const { data } = await supabase
    .from("savings_log")
    .select("amount_saved")
    .eq("consumer_id", consumerId);
  return (data ?? []).reduce((sum, r) => sum + r.amount_saved, 0);
}

export async function getCommissionWallet(supplierId: string) {
  const { data } = await supabase
    .from("commission_wallet")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });
  return data;
}

export async function getSupplierConsumers(supplierId: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("linked_supplier_id", supplierId)
    .eq("role", "consumer");
  return data;
}

export async function getMarketRates(district: string) {
  const { data } = await supabase
    .from("market_rates")
    .select("*")
    .eq("district", district)
    .order("updated_at", { ascending: false })
    .limit(5);
  return data;
}

export async function subscribeToWaterSessions(
  supplierId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel("supplier-water-activity")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "water_sessions", filter: `supplier_id=eq.${supplierId}` },
      callback
    )
    .subscribe();
}

export async function subscribeToNotifications(
  userId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel("user-notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `to_user_id=eq.${userId}` },
      callback
    )
    .subscribe();
}

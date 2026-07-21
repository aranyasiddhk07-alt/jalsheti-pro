import { supabase } from "../lib/supabase";
import type { CropAdvisory, PestAlert } from "../types";

async function getLatestAdvisory(consumerId: string): Promise<CropAdvisory | null> {
  const { data, error } = await supabase
    .from("crop_advisories")
    .select("*")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as CropAdvisory | null;
}

async function getAdvisoryHistory(
  consumerId: string,
  limit = 10,
): Promise<CropAdvisory[]> {
  const { data, error } = await supabase
    .from("crop_advisories")
    .select("*")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CropAdvisory[];
}

async function getActivePestAlerts(fieldId: string): Promise<PestAlert[]> {
  const { data, error } = await supabase
    .from("pest_alerts")
    .select("*")
    .eq("field_id", fieldId)
    .eq("is_acknowledged", false)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PestAlert[];
}

async function acknowledgePestAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from("pest_alerts")
    .update({ is_acknowledged: true })
    .eq("id", alertId);

  if (error) throw new Error(error.message);
}

export const advisoryService = {
  getLatestAdvisory,
  getAdvisoryHistory,
  getActivePestAlerts,
  acknowledgePestAlert,
};

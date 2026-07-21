import { supabase } from "../lib/supabase";
import type { WaterSession } from "../types";

async function startWaterSession(
  fieldId: string,
  consumerId: string,
  supplierId: string,
): Promise<WaterSession | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("water_sessions")
    .insert({
      field_id: fieldId,
      consumer_id: consumerId,
      supplier_id: supplierId,
      actual_start_time: now,
      status: "started",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as WaterSession;
}

async function stopWaterSession(
  sessionId: string,
): Promise<{ session: WaterSession | null; advisoryGenerated: boolean }> {
  const now = new Date().toISOString();

  const { data: session, error: updateError } = await supabase
    .from("water_sessions")
    .update({
      actual_stop_time: now,
      status: "completed",
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  const updated = session as unknown as WaterSession;

  if (updated) {
    const start = new Date(updated.actual_start_time!).getTime();
    const stop = new Date(updated.actual_stop_time!).getTime();
    const durationMinutes = Math.round((stop - start) / 60000);

    await supabase
      .from("water_sessions")
      .update({ duration_minutes: durationMinutes })
      .eq("id", sessionId);

    try {
      await supabase.functions.invoke("generate-advisory", {
        body: { sessionId },
      });
      return { session: updated, advisoryGenerated: true };
    } catch {
      return { session: updated, advisoryGenerated: false };
    }
  }

  return { session: updated, advisoryGenerated: false };
}

async function getActiveSession(fieldId: string): Promise<WaterSession | null> {
  const { data } = await supabase
    .from("water_sessions")
    .select("*")
    .eq("field_id", fieldId)
    .eq("status", "started")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as unknown as WaterSession | null;
}

async function getSessionHistory(
  fieldId: string,
  limit = 20,
): Promise<WaterSession[]> {
  const { data, error } = await supabase
    .from("water_sessions")
    .select("*")
    .eq("field_id", fieldId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WaterSession[];
}

async function cancelWaterSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("water_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
}

async function acknowledgeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("water_sessions")
    .update({ supplier_acknowledged: true })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
}

export const waterService = {
  startWaterSession,
  stopWaterSession,
  getActiveSession,
  getSessionHistory,
  cancelWaterSession,
  acknowledgeSession,
};

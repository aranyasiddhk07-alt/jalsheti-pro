import { supabase } from "../lib/supabase";
import type { Field, SoilCard } from "../types";

async function getField(consumerId: string): Promise<Field | null> {
  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("consumer_id", consumerId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as Field | null;
}

async function createField(
  consumerId: string,
  supplierId: string,
  params: {
    fieldAreaAcres: number;
    sugarcaneVariety: string;
    plantingDate: string;
    cropType: string;
    rowSpacingFeet: number;
    village?: string;
  },
): Promise<Field | null> {
  const { data, error } = await supabase
    .from("fields")
    .insert({
      consumer_id: consumerId,
      supplier_id: supplierId,
      field_area_acres: params.fieldAreaAcres,
      sugarcane_variety: params.sugarcaneVariety,
      planting_date: params.plantingDate,
      crop_type: params.cropType,
      row_spacing_feet: params.rowSpacingFeet,
      village: params.village,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Field;
}

async function updateField(
  fieldId: string,
  updates: Partial<Field>,
): Promise<Field | null> {
  const { data, error } = await supabase
    .from("fields")
    .update(updates)
    .eq("id", fieldId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Field;
}

async function saveSoilCard(
  fieldId: string,
  consumerId: string,
  answers: number[],
  result: Record<string, unknown>,
): Promise<SoilCard | null> {
  const { data, error } = await supabase
    .from("soil_cards")
    .insert({
      field_id: fieldId,
      consumer_id: consumerId,
      answers,
      result,
      soil_type_detected: result.soilType as string,
      ph_estimate: result.phEstimate as string,
      nitrogen_level: result.nitrogenLevel as string,
      water_retention: result.waterRetention as string,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as SoilCard;
}

async function getLatestSoilCard(fieldId: string): Promise<SoilCard | null> {
  const { data, error } = await supabase
    .from("soil_cards")
    .select("*")
    .eq("field_id", fieldId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as SoilCard | null;
}

async function saveOrganicResources(
  consumerId: string,
  resources: {
    has_cattle: boolean;
    has_poultry: boolean;
    has_goat_sheep: boolean;
    has_biogas_plant: boolean;
    near_sugar_factory: boolean;
  },
): Promise<void> {
  const { error } = await supabase
    .from("organic_resources")
    .upsert({
      consumer_id: consumerId,
      ...resources,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}

export const fieldService = {
  getField,
  createField,
  updateField,
  saveSoilCard,
  getLatestSoilCard,
  saveOrganicResources,
};

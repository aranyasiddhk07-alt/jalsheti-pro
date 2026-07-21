/**
 * Solid Fertilizer Engine
 * Brand recommendations, chemical reduction logic, and re-exports from cropIntelligence.
 */

import {
  getFertilizerSchedule,
  getNextFertilizerAction,
  type FertilizerStage,
} from '../crop/cropIntelligence';

export { getFertilizerSchedule, getNextFertilizerAction };
export type { FertilizerStage };

// â”€â”€ Brand Lookup Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type FertilizerType = 'urea' | 'dap' | 'mop' | 'npk_blend' | 'zinc' | 'gypsum';

const BRAND_TABLE: Record<FertilizerType, string[]> = {
  urea: ['IFFCO Urea', 'Coromandel Urea', 'RCF Urea'],
  dap: ['IFFCO DAP'],
  mop: ['Mahadhan MOP'],
  npk_blend: ['Mahadhan 10:26:26', 'Coromandel Gromor 12:32:16'],
  zinc: ['Mahadhan Zinc Sulphate', 'Tata Zinc Sulphate'],
  gypsum: ['Commodity Gypsum'],
};

/**
 * Return recommended brand(s) for a given fertilizer type.
 */
export function getBrandRecommendations(type: FertilizerType): string[] {
  return BRAND_TABLE[type] ?? [];
}

// â”€â”€ Chemical Reduction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * If organic inputs were applied, reduce chemical dosage by 25%.
 */
export function getChemicalReductionPercent(organicInputApplied: boolean): number {
  return organicInputApplied ? 25 : 0;
}
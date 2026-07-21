/**
 * Crop Intelligence Engine
 * Pure functions for growth stage estimation, fertilizer scheduling, and next-action logic.
 * No side effects. No database access. All data is passed in and results are computed.
 */

import { WeatherData } from '../../types';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface GrowthStage {
  stage: string;
  stageMarathi: string;
  dayNumber: number;
  irrigationIntervalDays: number;
  criticalityLevel: number; // 1â€“10, 10 = most critical
}

export interface FertilizerStage {
  daysAfterPlanting: number;
  label: string;
  labelMarathi: string;
  ureaKg: number;
  dapKg: number;
  mopKg: number;
  zincKg: number;
  gypsumKg: number;
  split: 'none' | 'urea' | 'all';
  totalNutrientsKg: number; // Approx N + P2O5 + K2O
}

export interface FertilizerAction {
  status: 'due' | 'upcoming' | 'hold_for_rain' | 'none';
  nextStage?: FertilizerStage;
  reason?: string;
  reasonMarathi?: string;
  savingsEvent?: string;
}

export type SoilType = 'black_cotton' | 'red_laterite' | 'sandy' | 'alluvial';
export type CropType = 'adsali' | 'suru' | 'preseasonal';

// â”€â”€ Growth Stage Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STAGE_DEFINITIONS = [
  { name: 'germination', marathi: 'à¤‰à¤—à¤µà¤£', maxDay: 35, irrigationInterval: 7, criticality: 5 },
  { name: 'tillering', marathi: 'à¤«à¥à¤Ÿà¤µà¥‡', maxDay: 100, irrigationInterval: 8, criticality: 10 },
  { name: 'grand_growth', marathi: 'à¤œà¥‹à¤®à¤¦à¤¾à¤° à¤µà¤¾à¤¢', maxDay: 270, irrigationInterval: 10, criticality: 8 },
  { name: 'maturity', marathi: 'à¤ªà¤°à¤¿à¤ªà¤•à¥à¤µà¤¤à¤¾', maxDay: 330, irrigationInterval: 15, criticality: 6 },
  { name: 'harvest', marathi: 'à¤•à¤¾à¤ªà¤£à¥€', maxDay: Infinity, irrigationInterval: 0, criticality: 0 },
];

/**
 * Determine the current growth stage of sugarcane based on days since planting.
 */
export function getGrowthStage(plantingDate: Date): GrowthStage {
  const today = new Date();
  const dayNumber = Math.floor((today.getTime() - plantingDate.getTime()) / 86_400_000);

  if (dayNumber < 0) {
    return {
      stage: 'pre_planting',
      stageMarathi: 'à¤²à¤¾à¤—à¤µà¤¡à¥€à¤ªà¥‚à¤°à¥à¤µ',
      dayNumber,
      irrigationIntervalDays: 0,
      criticalityLevel: 0,
    };
  }

  for (const def of STAGE_DEFINITIONS) {
    if (dayNumber <= def.maxDay) {
      return {
        stage: def.name,
        stageMarathi: def.marathi,
        dayNumber,
        irrigationIntervalDays: def.irrigationInterval,
        criticalityLevel: def.criticality,
      };
    }
  }

  return {
    stage: 'harvest',
    stageMarathi: 'à¤•à¤¾à¤ªà¤£à¥€',
    dayNumber,
    irrigationIntervalDays: 0,
    criticalityLevel: 0,
  };
}

// â”€â”€ Fertilizer Schedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BASE_DOSES_PER_ACRE = { urea: 130, dap: 52, mop: 40 };

function getSplitPlan(cropType: CropType) {
  const adsali = cropType === 'adsali';
  return adsali
    ? [
        { day: 0, label: 'Basal', labelMarathi: 'à¤¬à¥‡à¤¸à¤²', urea: 0.2, dap: 1.0, mop: 0.3, gypsum: 1.0 },
        { day: 30, label: 'TD1', labelMarathi: 'à¤Ÿà¥€à¤¡à¥€à¥§', urea: 0.3, dap: 0.0, mop: 0.3, gypsum: 0.0 },
        { day: 60, label: 'TD2', labelMarathi: 'à¤Ÿà¥€à¤¡à¥€à¥¨', urea: 0.3, dap: 0.0, mop: 0.4, gypsum: 0.0 },
        { day: 90, label: 'TD3', labelMarathi: 'à¤Ÿà¥€à¤¡à¥€à¥©', urea: 0.2, dap: 0.0, mop: 0.0, gypsum: 0.0 },
      ]
    : [
        { day: 0, label: 'Basal', labelMarathi: 'à¤¬à¥‡à¤¸à¤²', urea: 0.25, dap: 1.0, mop: 0.4, gypsum: 1.0 },
        { day: 30, label: 'TD1', labelMarathi: 'à¤Ÿà¥€à¤¡à¥€à¥§', urea: 0.4, dap: 0.0, mop: 0.3, gypsum: 0.0 },
        { day: 60, label: 'TD2', labelMarathi: 'à¤Ÿà¥€à¤¡à¥€à¥¨', urea: 0.35, dap: 0.0, mop: 0.3, gypsum: 0.0 },
      ];
}

interface SoilModifiers {
  mopMultiplier: number;
  ureaMultiplier: number;
  ureaSplitStrategy: 'standard' | 'split_3' | 'split_4';
  zincAddKg: number;      // per acre
  extraGypsumKg: number;   // per acre
}

function getSoilModifiers(soil: SoilType): SoilModifiers {
  switch (soil) {
    case 'black_cotton':
      return { mopMultiplier: 0.8, ureaMultiplier: 0.9, ureaSplitStrategy: 'split_3', zincAddKg: 0, extraGypsumKg: 0 };
    case 'red_laterite':
      return { mopMultiplier: 1.0, ureaMultiplier: 1.0, ureaSplitStrategy: 'standard', zincAddKg: 10, extraGypsumKg: 0 };
    case 'sandy':
      return { mopMultiplier: 0.9, ureaMultiplier: 1.0, ureaSplitStrategy: 'split_4', zincAddKg: 5, extraGypsumKg: 10 };
    default: // alluvial
      return { mopMultiplier: 1.0, ureaMultiplier: 1.0, ureaSplitStrategy: 'standard', zincAddKg: 0, extraGypsumKg: 0 };
  }
}

/**
 * Generate a full fertilizer schedule for a given field.
 * @returns Sorted array of scheduled applications.
 */
export function getFertilizerSchedule(
  fieldAreaAcres: number,
  soilType: SoilType,
  cropType: CropType,
): FertilizerStage[] {
  const area = fieldAreaAcres;
  const splits = getSplitPlan(cropType);
  const mod = getSoilModifiers(soilType);

  return splits.map((s, idx) => {
    let urea = BASE_DOSES_PER_ACRE.urea * s.urea * area * mod.ureaMultiplier;
    let dap  = BASE_DOSES_PER_ACRE.dap  * s.dap  * area;
    let mop  = BASE_DOSES_PER_ACRE.mop  * s.mop  * area * mod.mopMultiplier;

    // Further split urea if the soil demands it
    if (mod.ureaSplitStrategy === 'split_4' && s.label !== 'Basal') {
      urea = BASE_DOSES_PER_ACRE.urea * 0.25 * area;
    } else if (mod.ureaSplitStrategy === 'split_3' && s.label !== 'Basal') {
      urea *= 1.0; // already split into 3 parts via fractions
    }

    const zincKg = (idx === 0 ? mod.zincAddKg * area : 0);
    const gypsumKg = mod.extraGypsumKg * area * s.gypsum;
    const totalNutrientsKg = urea * 0.46 + dap * 0.46 + mop * 0.6;

    return {
      daysAfterPlanting: s.day,
      label: s.label,
      labelMarathi: s.labelMarathi,
      ureaKg: round1(urea),
      dapKg: round1(dap),
      mopKg: round1(mop),
      zincKg: round1(zincKg),
      gypsumKg: round1(gypsumKg),
      split: mod.ureaSplitStrategy === 'split_4' ? 'urea' : 'none',
      totalNutrientsKg: round1(totalNutrientsKg),
    };
  });
}

// â”€â”€ Next Action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determine the next fertilizer action considering schedule and weather.
 * Weather gate: >30 mm rain in next 48 hours â‡’ hold urea application.
 */
export function getNextFertilizerAction(
  schedule: FertilizerStage[],
  daysSincePlanting: number,
  weather: WeatherData,
): FertilizerAction {
  if (!schedule.length) return { status: 'none' };

  const upcoming = schedule
    .filter(s => s.daysAfterPlanting > daysSincePlanting)
    .sort((a, b) => a.daysAfterPlanting - b.daysAfterPlanting);

  if (!upcoming.length) return { status: 'none' };

  const next = upcoming[0];
  if (!next) return { status: 'none' };
  const rain48h = weather.rainMm48h ?? 0;

  if (rain48h > 30) {
    return {
      status: 'hold_for_rain',
      nextStage: next,
      reason: 'Heavy rainfall expected; delaying urea application to prevent leaching',
      reasonMarathi: 'à¤®à¥à¤¸à¤³à¤§à¤¾à¤° à¤ªà¤¾à¤µà¤¸à¤¾à¤®à¥à¤³à¥‡ à¤¯à¥à¤°à¤¿à¤¯à¤¾ à¤µà¤¾à¤ªà¤°à¤£à¥‡ à¤Ÿà¤¾à¤³à¤¾. à¤¨à¤¤à¥à¤° à¤µà¤¾à¤¹à¥‚à¤¨ à¤œà¤¾à¤£à¥à¤¯à¤¾à¤šà¥€ à¤¶à¤•à¥à¤¯à¤¤à¤¾.',
      savingsEvent: 'UREA_RAIN_DELAY',
    };
  }

  const daysUntil = next.daysAfterPlanting - daysSincePlanting;
  return {
    status: daysUntil <= 3 ? 'due' : 'upcoming',
    nextStage: next,
    reason: daysUntil <= 3
      ? 'à¤«à¤°à¥à¤Ÿà¤¿à¤²à¤¾à¤¯à¤à¤° application is due within 3 days'
      : `Fertilizer application due in ${daysUntil} days`,
    reasonMarathi: daysUntil <= 3
      ? 'à¤ªà¥à¤¢à¥€à¤² à¥© à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤¤ à¤–à¤¤ à¤¦à¥‡à¤£à¥‡ à¤†à¤µà¤¶à¥à¤¯à¤• à¤†à¤¹à¥‡'
      : `à¤–à¤¤ à¤¦à¥à¤¯à¤¾à¤¯à¤²à¤¾ ${daysUntil} à¤¦à¤¿à¤µà¤¸ à¤¬à¤¾à¤•à¥€`,
  };
}

// â”€â”€ Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
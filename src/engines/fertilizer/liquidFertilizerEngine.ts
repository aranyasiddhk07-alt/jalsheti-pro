/**
 * Liquid Fertilizer Engine
 * Suggests liquid booster applications (Nano Urea, Nano DAP, water-soluble NPK) based on deficiencies.
 */

import { SoilCardResult } from '../crop/soilCardAnalysis';
import { FertilizerStage } from '../crop/cropIntelligence';
import { WeatherData } from '../../types';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface LiquidBoosterSuggestion {
  eligible: boolean;
  product: string;
  doseMarathi: string;
  framingMarathi: string; // Marketing / advisory text positioning it as a booster
}

// â”€â”€ Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determine if a liquid booster is appropriate.
 * Trigger: nitrogen deficiency + between solid doses + no rain in 24 hours.
 */
export function getLiquidBoosterSuggestion(
  soilCardResult: SoilCardResult,
  fertilizerSchedule: FertilizerStage[],
  daysSincePlanting: number,
  weather: WeatherData,
): LiquidBoosterSuggestion | null {
  // Check nitrogen deficiency
  if (soilCardResult.nitrogenLevel !== 'low') {
    return null;
  }

  // Check we are between solid doses (not too close to next/previous)
  const upcoming = fertilizerSchedule.filter(s => s.daysAfterPlanting > daysSincePlanting);
  const nextDays = upcoming.length ? upcoming[0].daysAfterPlanting : Infinity;
  const prevDays = fertilizerSchedule.filter(s => s.daysAfterPlanting <= daysSincePlanting).pop()?.daysAfterPlanting ?? 0;

  if (daysSincePlanting - prevDays < 14 || nextDays - daysSincePlanting < 14) {
    return null; // too close to a solid dose
  }

  // Weather gate: no rain in 24h
  if ((weather.rainMm24h ?? 0) > 1 || (weather.rainForecast24h ?? 0) > 1) {
    return null;
  }

  // Recommend Nano Urea as the default liquid booster
  return {
    eligible: true,
    product: 'Nano Urea',
    doseMarathi: 'à¥¨ à¤¤à¥‡ à¥ª à¤®à¤¿.à¤²à¥€. à¤ªà¥à¤°à¤¤à¤¿ à¤²à¤¿à¤Ÿà¤° à¤ªà¤¾à¤£à¥€ (à¤à¤•à¥‚à¤£ à¥«à¥¦à¥¦ à¤®à¤¿.à¤²à¥€. à¤¤à¥‡ à¥§ à¤²à¤¿à¤Ÿà¤° à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤°)',
    framingMarathi: 'à¤¨à¤¤à¥à¤°à¤¾à¤šà¥€ à¤•à¤®à¤¤à¤°à¤¤à¤¾ à¤­à¤°à¥‚à¤¨ à¤•à¤¾à¤¢à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¬à¥‚à¤¸à¥à¤Ÿà¤° à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¨à¥…à¤¨à¥‹ à¤¯à¥à¤°à¤¿à¤¯à¤¾à¤šà¤¾ à¤µà¤¾à¤ªà¤° à¤•à¤°à¤¾. à¤¹à¤¾ à¤¨à¤¿à¤¯à¤®à¤¿à¤¤ à¤¯à¥à¤°à¤¿à¤¯à¤¾à¤²à¤¾ à¤ªà¤°à¥à¤¯à¤¾à¤¯ à¤¨à¤¾à¤¹à¥€.',
  };
}
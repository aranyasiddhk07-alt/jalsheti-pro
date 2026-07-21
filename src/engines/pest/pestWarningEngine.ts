/**
 * Pest Warning Engine
 * Evaluates risk of major sugarcane diseases based on weather, growth stage, and variety.
 * Returns a list of PestRisk objects with Marathi advisories.
 */

import { WeatherData, GrowthStage } from '../../types';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PestRisk {
  pestName: string;
  pestNameMarathi: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  advisory: string;       // English
  treatment: string;      // Marathi treatment advice
  urgency: 'monitor' | 'act_soon' | 'act_now';
  confidence: number;     // 0â€“100
  explanation: string;
}

// â”€â”€ Disease Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DiseaseRule {
  pestName: string;
  pestNameMarathi: string;
  condition: (
    daysSincePlanting: number,
    growthStage: GrowthStage,
    weather: WeatherData,
    month: number,
    variety: string,
  ) => boolean;
  treatment: string;
}

const DISEASE_RULES: DiseaseRule[] = [
  {
    pestName: 'Early Shoot Borer',
    pestNameMarathi: 'à¤¸à¥à¤°à¤µà¤¾à¤¤à¥€à¤šà¥€ à¤–à¥‹à¤¡ à¤•à¤¿à¤¡',
    condition: (d, _g, w, m) =>
      d >= 15 && d <= 90 &&
      (w.avgTemp ?? 0) >= 25 && (w.avgTemp ?? 0) <= 30 &&
      (w.humidity ?? 0) > 70 &&
      m >= 3 && m <= 6,
    treatment: 'à¤«à¤¿à¤ªà¥à¤°à¥‹à¤¨à¤¿à¤² 0.3% à¤§à¥‚à¤³ 10-15 à¤•à¤¿.à¤—à¥à¤°à¥…./à¤à¤•à¤° à¤•à¤¿à¤‚à¤µà¤¾ à¤•à¥à¤²à¥‹à¤°à¤ªà¤¾à¤¯à¤°à¥€à¤«à¥‰à¤¸ 20% EC 400 à¤®à¤¿.à¤²à¥€./à¤à¤•à¤°.',
  },
  {
    pestName: 'Red Rot',
    pestNameMarathi: 'à¤²à¤¾à¤² à¤•à¥à¤œ',
    condition: (d, _g, w) =>
      d > 90 &&
      (w.rainMm ?? 0) > 50 &&
      (w.humidity ?? 0) > 85,
    treatment: 'à¤°à¥‹à¤—à¤—à¥à¤°à¤¸à¥à¤¤ à¤‰à¤¸à¤¾à¤šà¥€ à¤®à¥à¤³à¤¾à¤¸à¤•à¤Ÿ à¤¨à¤¾à¤¸à¤§à¥‚à¤¸ à¤•à¤°à¤¾. à¤•à¤¾à¤°à¥à¤¬à¥‡à¤¨à¥à¤¡à¤¾à¤à¤¿à¤® 0.1% à¤¦à¥à¤°à¤¾à¤µà¤£ à¤«à¤µà¤¾à¤°à¤¾.',
  },
  {
    pestName: 'Smut',
    pestNameMarathi: 'à¤•à¤¾à¤£à¥€ à¤°à¥‹à¤—',
    condition: (_d, _g, w, m) =>
      ((m >= 5 && m <= 6) || (m >= 10 && m <= 11)) &&
      (w.humidity ?? 0) > 75,
    treatment: 'à¤ªà¥à¤°à¥‹à¤ªà¤¿à¤•à¥‹à¤¨à¤¾à¤à¥‹à¤² 25% EC 400 à¤®à¤¿.à¤²à¥€./à¤à¤•à¤° à¤«à¤µà¤¾à¤°à¤£à¥€.',
  },
  {
    pestName: 'Internode Borer',
    pestNameMarathi: 'à¤†à¤‚à¤¤à¤°à¤—à¤¾à¤  à¤•à¤¿à¤¡',
    condition: (d, _g, w) =>
      d > 120 && (w.avgTemp ?? 0) > 28,
    treatment: 'à¤•à¤¾à¤°à¥à¤Ÿà¤¾à¤ª à¤¹à¤¾à¤¯à¤¡à¥à¤°à¥‹à¤•à¥à¤²à¥‹à¤°à¤¾à¤‡à¤¡ 4% GR 10 à¤•à¤¿.à¤—à¥à¤°à¥…./à¤à¤•à¤°.',
  },
  {
    pestName: 'Wilt',
    pestNameMarathi: 'à¤®à¤° à¤°à¥‹à¤—',
    condition: (d, _g, w, _m, variety) =>
      d > 10 && (w.daysWithoutIrrigation ?? 0) > 10 && variety !== 'Co0238', // Co0238 resistant
    treatment: 'à¤Ÿà¥à¤°à¤¾à¤¯à¤•à¥‹à¤¡à¤°à¥à¤®à¤¾ à¤µà¤¿à¤°à¤¿à¤¡à¥€ 2 à¤•à¤¿.à¤—à¥à¤°à¥…./à¤à¤•à¤° à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤®à¤¿à¤¸à¤³à¤¾.',
  },
  {
    pestName: 'Top Borer',
    pestNameMarathi: 'à¤µà¤°à¤šà¥€ à¤–à¥‹à¤¡ à¤•à¤¿à¤¡',
    condition: (d, _g, w) =>
      d > 120 && (w.avgTemp ?? 0) > 28,
    treatment: 'à¤«à¥à¤²à¥à¤¬à¥‡à¤‚à¤¡à¤¾à¤®à¤¾à¤‡à¤¡ 20% WG 100 à¤—à¥à¤°à¥…./à¤à¤•à¤°.',
  },
];

// â”€â”€ Variety Risk Multipliers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const VARIETY_MULTIPLIERS: Record<string, Record<string, number>> = {
  'Co86032': { redRot: 0.6, smut: 0.5, wilt: 0.7 },
  'CoM0265': { redRot: 0.6, smut: 0.5 },
  'Co94012': { redRot: 0.7 },
  'Co0238': { redRot: 1.8, topBorer: 1.6, wilt: 1.3 },
};

/**
 * Get the susceptibility multiplier for a given variety-disease combination.
 */
export function getVarietyRiskMultiplier(variety: string, disease: string): number {
  return VARIETY_MULTIPLIERS[variety]?.[disease] ?? 1.0;
}

// â”€â”€ Risk Evaluation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Evaluate pest risks for the current field conditions.
 */
export function evaluatePestRisks(
  weather: WeatherData,
  growthStage: GrowthStage,
  daysSincePlanting: number,
  currentMonth: number, // 1-12
  variety: string,
): PestRisk[] {
  return DISEASE_RULES.map(rule => {
    const conditionMet = rule.condition(
      daysSincePlanting,
      growthStage,
      weather,
      currentMonth,
      variety,
    );
    if (!conditionMet) {
      return null;
    }

    const multiplier = getVarietyRiskMultiplier(variety, rule.pestName);
    let baseRisk = 0;
    // Simple scoring: base on relevant weather / stage
    if (rule.pestName === 'Early Shoot Borer') baseRisk = 50;
    else if (rule.pestName === 'Red Rot') baseRisk = 70;
    else if (rule.pestName === 'Smut') baseRisk = 40;
    else if (rule.pestName === 'Internode Borer') baseRisk = 45;
    else if (rule.pestName === 'Wilt') baseRisk = 35;
    else if (rule.pestName === 'Top Borer') baseRisk = 45;

    const adjustedRisk = Math.min(100, baseRisk * multiplier);

    let riskLevel: PestRisk['riskLevel'];
    let urgency: PestRisk['urgency'];
    if (adjustedRisk >= 80) { riskLevel = 'critical'; urgency = 'act_now'; }
    else if (adjustedRisk >= 60) { riskLevel = 'high'; urgency = 'act_soon'; }
    else if (adjustedRisk >= 30) { riskLevel = 'medium'; urgency = 'act_soon'; }
    else { riskLevel = 'low'; urgency = 'monitor'; }

    const confidence = Math.round(conditionMet ? (multiplier <= 1 ? 75 : 55) : 0);

    return {
      pestName: rule.pestName,
      pestNameMarathi: rule.pestNameMarathi,
      riskLevel,
      advisory: `Risk of ${rule.pestName} is ${riskLevel}. ${multiplier > 1 ? 'Variety is susceptible.' : ''}`,
      treatment: rule.treatment,
      urgency,
      confidence,
      explanation: `Risk ${riskLevel} due to current weather and growth stage. Variety multiplier: ${multiplier}.`,
    } satisfies PestRisk;
  }).filter(Boolean) as PestRisk[];
}
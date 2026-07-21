/**
 * Row Geometry Engine
 * Determines maintenance tier, intercropping suggestions, and disease/weed multipliers
 * based on planting row spacing.
 */

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type MaintenanceTier = 'simplified' | 'standard' | 'advanced';

export interface MaintenanceTierInfo {
  tier: MaintenanceTier;
  descriptionMarathi: string;
}

// â”€â”€ Tier Calculation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Classify planting geometry based on inter-row spacing (feet).
 */
export function getMaintenanceTier(spacingFeet: number): MaintenanceTier {
  if (spacingFeet <= 3.5) return 'simplified';
  if (spacingFeet <= 4.0) return 'standard';
  return 'advanced';
}

// â”€â”€ Intercrop Suggestions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Return suggested intercrop crops for the given tier.
 */
export function getIntercropSuggestion(tier: MaintenanceTier): string[] {
  const suggestions: Record<MaintenanceTier, string[]> = {
    simplified: [], // no intercropping recommended
    standard: ['groundnut', 'greengram'],
    advanced: ['sunnhemp/dhaincha', 'groundnut', 'soybean', 'greengram'],
  };
  return suggestions[tier] ?? [];
}

// â”€â”€ Multipliers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Weed intensity multiplier based on tier, days since planting, and intercrop presence.
 */
export function getWeedIntensityMultiplier(
  tier: MaintenanceTier,
  daysSincePlanting: number,
  hasIntercrop: boolean,
): number {
  if (tier === 'simplified') {
    return daysSincePlanting <= 60 ? 1.3 : 0.5;
  }
  if (tier === 'advanced' && hasIntercrop) return 0.8;
  if (tier === 'advanced' && !hasIntercrop) return 1.4;
  // standard
  return 1.0;
}

/**
 * Airflow-related disease multiplier (higher means more disease pressure).
 */
export function getAirflowDiseaseMultiplier(tier: MaintenanceTier): number {
  switch (tier) {
    case 'simplified': return 1.1;
    case 'advanced':   return 0.95;
    default:           return 1.0;
  }
}
/**
 * Liquid Organic Engine
 * Tiered liquid organic preparations and combined chemical reduction logic.
 */

import { FarmResources } from './organicManureEngine';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OrganicTier = 'Tier0' | 'Tier1' | 'Tier2' | 'Tier2b' | 'Tier3' | 'Tier4';

export interface LiquidOrganicProduct {
  tier: OrganicTier;
  name: string;
  marathi: string;
  descriptionMarathi: string;
  applicationWindow: string;   // when to apply
  weatherDependent: boolean;   // if foliar, need dry period
}

// â”€â”€ Product Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TIER_DEFINITIONS: LiquidOrganicProduct[] = [
  {
    tier: 'Tier0',
    name: 'Biogas Slurry (liquid)',
    marathi: 'à¤¬à¤¾à¤¯à¥‹à¤—à¥…à¤¸ à¤¸à¥à¤²à¤°à¥€',
    descriptionMarathi: 'à¤¬à¤¾à¤¯à¥‹à¤—à¥…à¤¸ à¤ªà¥à¤²à¤¾à¤‚à¤Ÿà¤®à¤§à¥€à¤² à¤¦à¥à¤°à¤µà¤°à¥‚à¤ª à¤¸à¥à¤²à¤°à¥€ à¤¥à¥‡à¤Ÿ à¤¶à¥‡à¤¤à¤¾à¤¤ à¤µà¤¾à¤ªà¤°à¤¾.',
    applicationWindow: 'à¤ªà¤¿à¤•à¤¾à¤šà¥à¤¯à¤¾ à¤•à¥‹à¤£à¤¤à¥à¤¯à¤¾à¤¹à¥€ à¤…à¤µà¤¸à¥à¤¥à¥‡à¤¤',
    weatherDependent: false,
  },
  {
    tier: 'Tier1',
    name: 'Matka Khad',
    marathi: 'à¤®à¤Ÿà¤•à¤¾ à¤–à¤¤',
    descriptionMarathi: 'à¤—à¥‹à¤®à¥‚à¤¤à¥à¤°, à¤¶à¥‡à¤£, à¤—à¥‚à¤³ à¤†à¤£à¤¿ à¤ªà¤¾à¤£à¥€ à¤¯à¤¾à¤‚à¤šà¥‡ à¤®à¤¿à¤¶à¥à¤°à¤£ à¥§à¥¦-à¥§à¥« à¤¦à¤¿à¤µà¤¸ à¤ à¥‡à¤µà¥‚à¤¨ à¤µà¤¾à¤ªà¤°à¤¾à¤µà¥‡.',
    applicationWindow: 'à¤ªà¥‡à¤°à¤£à¥€à¤¨à¤‚à¤¤à¤° à¥©à¥¦-à¥¬à¥¦ à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤¨à¥€',
    weatherDependent: true,
  },
  {
    tier: 'Tier2',
    name: 'Jeevamrut',
    marathi: 'à¤œà¥€à¤µà¤¾à¤®à¥ƒà¤¤ (à¤ªà¥à¤°à¤®à¥à¤–)',
    descriptionMarathi: 'à¤¦à¥‡à¤¶à¥€ à¤—à¤¾à¤¯à¥€à¤šà¥‡ à¤¶à¥‡à¤£, à¤—à¥‹à¤®à¥‚à¤¤à¥à¤°, à¤—à¥‚à¤³, à¤¡à¤¾à¤³à¥€à¤šà¥‡ à¤ªà¥€à¤  à¤†à¤£à¤¿ à¤®à¤¾à¤¤à¥€ à¤ªà¤¾à¤£à¥à¤¯à¤¾à¤¤ à¤®à¤¿à¤¸à¤³à¥‚à¤¨ à¥«-à¥­ à¤¦à¤¿à¤µà¤¸ à¤†à¤‚à¤¬à¤µà¤¾à¤µà¥‡.',
    applicationWindow: 'à¤¦à¤° à¥§à¥« à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤¨à¥€',
    weatherDependent: false,
  },
  {
    tier: 'Tier2b',
    name: 'Beejamrut',
    marathi: 'à¤¬à¥€à¤œà¤¾à¤®à¥ƒà¤¤',
    descriptionMarathi: 'à¤¬à¤¿à¤¯à¤¾à¤£à¥‡ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¥‡à¤¸à¤¾à¤ à¥€ à¤µà¤¾à¤ªà¤°à¤¾. à¤ªà¥‡à¤°à¤£à¥€à¤ªà¥‚à¤°à¥à¤µà¥€ à¤¬à¤¿à¤¯à¤¾à¤£à¥‡ à¤­à¤¿à¤œà¤µà¤¾à¤µà¥‡.',
    applicationWindow: 'à¤ªà¥‡à¤°à¤£à¥€à¤šà¥à¤¯à¤¾ à¤µà¥‡à¤³à¥€',
    weatherDependent: false,
  },
  {
    tier: 'Tier3',
    name: 'Vermiwash',
    marathi: 'à¤—à¤¾à¤‚à¤¡à¥‚à¤³ à¤§à¥‚à¤£',
    descriptionMarathi: 'à¤—à¤¾à¤‚à¤¡à¥‚à¤³à¤–à¤¤ à¤¯à¥à¤¨à¤¿à¤Ÿà¤®à¤§à¥€à¤² à¤¦à¥à¤°à¤µ. à¤à¤•à¤¦à¤¾ à¤¸à¥‡à¤Ÿà¤…à¤ª à¤•à¥‡à¤²à¥à¤¯à¤¾à¤µà¤° à¤µà¤¾à¤°à¤‚à¤µà¤¾à¤° à¤®à¤¿à¤³à¤¤à¥‡.',
    applicationWindow: 'à¤®à¤¹à¤¿à¤¨à¥à¤¯à¤¾à¤¤à¥‚à¤¨ à¤à¤•à¤¦à¤¾',
    weatherDependent: false,
  },
  {
    tier: 'Tier4',
    name: 'Panchagavya',
    marathi: 'à¤ªà¤‚à¤šà¤—à¤µà¥à¤¯',
    descriptionMarathi: 'à¤¦à¥à¤§, à¤¦à¤¹à¥€, à¤¤à¥‚à¤ª, à¤—à¥‹à¤®à¥‚à¤¤à¥à¤°, à¤¶à¥‡à¤£ à¤¯à¤¾à¤‚à¤šà¥‡ à¤®à¤¿à¤¶à¥à¤°à¤£ à¥¨à¥§ à¤¦à¤¿à¤µà¤¸ à¤†à¤‚à¤¬à¤µà¥‚à¤¨ à¤µà¤¾à¤ªà¤°à¤¾.',
    applicationWindow: 'à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤…à¤ªà¤—à¥à¤°à¥‡à¤¡, à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¥‡à¤¨à¥à¤¸à¤¾à¤°',
    weatherDependent: true,
  },
];

/**
 * Return available liquid organic tiers based on farm resources.
 */
export function getLiquidOrganicTiers(resources: FarmResources): LiquidOrganicProduct[] {
  const available: LiquidOrganicProduct[] = [];

  if (resources.hasBiogasPlant) available.push(TIER_DEFINITIONS[0]); // Tier0
  available.push(TIER_DEFINITIONS[1]); // Tier1 always possible
  available.push(TIER_DEFINITIONS[2]); // Tier2 flagship
  available.push(TIER_DEFINITIONS[3]); // Tier2b
  if (resources.hasCattle || resources.hasGoatSheep) {
    available.push(TIER_DEFINITIONS[4]); // Tier3
    available.push(TIER_DEFINITIONS[5]); // Tier4
  }

  return available;
}

/**
 * Combined chemical reduction from solid organic + regular liquid organic applications.
 * Capped at 35% max.
 */
export function getCombinedChemicalReduction(
  solidOrganicApplied: boolean,
  liquidOrganicRegular: boolean,
): number {
  let reduction = 0;
  if (solidOrganicApplied) reduction += 25;
  if (liquidOrganicRegular) reduction += 10;
  return Math.min(reduction, 35);
}
/**
 * Organic Manure Engine
 * Primary manure recommendations based on farm resources (solid/organic inputs).
 */

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface FarmResources {
  hasCattle: boolean;
  hasPoultry: boolean;
  hasGoatSheep: boolean;
  hasBiogasPlant: boolean;
  nearSugarFactory: boolean;
}

export interface ManureRecommendation {
  primary: Array<{ name: string; marathi: string; doseRange: string }>;
  secondary: Array<{ name: string; marathi: string; doseRange: string }>;
}

// â”€â”€ Recommendation Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Return primary and secondary solid manure types with dose ranges.
 */
export function getPrimaryManureRecommendation(resources: FarmResources): ManureRecommendation {
  const primary: ManureRecommendation['primary'] = [];
  const secondary: ManureRecommendation['secondary'] = [];

  // Priority order determines primary vs secondary
  if (resources.nearSugarFactory) {
    primary.push({ name: 'Press Mud', marathi: 'à¤ªà¥à¤°à¥‡à¤¸à¤®à¤¡', doseRange: 'à¤µà¤¾à¤³à¤²à¥‡à¤²à¥‡ à¥§-à¥¨ à¤Ÿà¤¨ / à¤“à¤²à¥‡ à¥ª-à¥§à¥¦ à¤Ÿà¤¨ à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤°' });
  }

  if (resources.hasCattle) {
    (primary.length < 2 ? primary : secondary).push({
      name: 'FYM',
      marathi: 'à¤¶à¥‡à¤£à¤–à¤¤',
      doseRange: 'à¥«-à¥¨à¥¦ à¤Ÿà¤¨ à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤°',
    });
  }

  if (resources.hasPoultry) {
    (primary.length < 2 ? primary : secondary).push({
      name: 'Poultry Manure',
      marathi: 'à¤•à¥‹à¤‚à¤¬à¤¡à¥€ à¤–à¤¤',
      doseRange: 'à¥¨.à¥«-à¥§à¥¦ à¤Ÿà¤¨ à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤° (à¤¶à¥‡à¤£à¤–à¤¤à¤¾à¤šà¥à¤¯à¤¾ à¤¨à¤¿à¤®à¥à¤®à¥‡)',
    });
  }

  if (resources.hasGoatSheep) {
    (primary.length < 2 ? primary : secondary).push({
      name: 'Goat/Sheep Manure',
      marathi: 'à¤¶à¥‡à¤³à¥€/à¤®à¥‡à¤‚à¤¢à¥€ à¤–à¤¤',
      doseRange: 'à¥¨-à¥ª à¤Ÿà¤¨ à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤°',
    });
  }

  if (resources.hasBiogasPlant) {
    (primary.length < 2 ? primary : secondary).push({
      name: 'Biogas Slurry',
      marathi: 'à¤¬à¤¾à¤¯à¥‹à¤—à¥…à¤¸ à¤¸à¥à¤²à¤°à¥€',
      doseRange: 'à¤ªà¥à¤°à¤¤à¤¿ à¤à¤•à¤° à¥¨-à¥© à¤Ÿà¤¨ (à¤•à¥‹à¤°à¤¡à¥‡)',
    });
  }

  return { primary, secondary };
}
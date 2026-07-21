/**
 * Weed Engine
 * Recommends herbicide products based on weed type, crop day, and weather constraints.
 */

import { WeatherData } from '../../types';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type WeedType = 'grassy_broadleaf_new' | 'broadleaf_medium' | 'mixed' | 'broadleaf_old' | 'sedge';

export interface WeedRecommendation {
  product: string;
  brand: string;
  timingAdviceMarathi: string;
  canSprayNow: boolean;
}

// â”€â”€ Product Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PRODUCT_TABLE: Record<WeedType, { product: string; brand: string; timingAdviceMarathi: string }> = {
  grassy_broadleaf_new: {
    product: 'Atrazine',
    brand: 'Strike (Atrazine 50% WP)',
    timingAdviceMarathi: 'à¤‰à¤—à¤µà¤£à¥€à¤¨à¤‚à¤¤à¤° à¥¨à¥¦-à¥¨à¥« à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤¨à¥€ à¤«à¤µà¤¾à¤°à¤¾à¤µà¥‡.',
  },
  broadleaf_medium: {
    product: 'Metribuzin',
    brand: 'Tata Metri / Sencor (Metribuzin 70% WP)',
    timingAdviceMarathi: 'à¤ªà¥€à¤• à¤²à¤¾à¤—à¤µà¤¡à¥€à¤¨à¤‚à¤¤à¤° à¥ªà¥¦-à¥¬à¥¦ à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤¨à¥€ à¤«à¤µà¤¾à¤°à¤¾à¤µà¥‡.',
  },
  mixed: {
    product: 'Metribuzin + 2,4-D',
    brand: 'Nakshatra (Metribuzin + 2,4-D)',
    timingAdviceMarathi: 'à¤ªà¥€à¤• à¥©à¥¦-à¥«à¥¦ à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤šà¥‡ à¤…à¤¸à¤¤à¤¾à¤¨à¤¾ à¤«à¤µà¤¾à¤°à¤¾à¤µà¥‡.',
  },
  broadleaf_old: {
    product: '2,4-D Amine',
    brand: '2,4-D Amine Salt 58% SL',
    timingAdviceMarathi: 'à¤ªà¥€à¤• à¥¬à¥¦ à¤¦à¤¿à¤µà¤¸à¤¾à¤‚à¤ªà¥‡à¤•à¥à¤·à¤¾ à¤œà¤¾à¤¸à¥à¤¤ à¤…à¤¸à¤²à¥à¤¯à¤¾à¤¸ à¤µà¤¾à¤ªà¤°à¤¾à¤µà¥‡.',
  },
  sedge: {
    product: 'à¤¹à¤¾à¤¤à¤–à¥à¤°à¤ªà¤£à¥€ (Manual)',
    brand: 'No chemical â€” à¤¹à¤¾à¤¤à¤¾à¤¨à¥‡ à¤•à¤¿à¤‚à¤µà¤¾ à¤–à¥à¤°à¤ªà¥à¤¯à¤¾à¤¨à¥‡ à¤•à¤¾à¤¢à¤¾',
    timingAdviceMarathi: 'à¤“à¤² à¤…à¤¸à¤¤à¤¾à¤¨à¤¾ à¤®à¤¾à¤¤à¥€ à¤–à¥à¤°à¤ªà¥‚à¤¨ à¤•à¤¾à¤¢à¤¾.',
  },
};

/**
 * Recommend weed control strategy. Weather gate: no spray if rain expected within 24 hours.
 */
export function getWeedRecommendation(
  weedType: WeedType,
  _cropDay: number,
  weather: WeatherData,
): WeedRecommendation {
  const entry = PRODUCT_TABLE[weedType];
  const rainExpected24h = (weather.rainMm24h ?? 0) > 2 || (weather.rainForecast24h ?? 0) > 2;

  return {
    product: entry.product,
    brand: entry.brand,
    timingAdviceMarathi: entry.timingAdviceMarathi,
    canSprayNow: !rainExpected24h,
  };
}
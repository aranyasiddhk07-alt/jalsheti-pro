/**
 * Commission & Referral Logic
 * Pure functions for calculating supplier/agent earnings.
 * All amounts are in Indian Rupees (â‚¹).
 */

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PlanTier = 'basic' | 'smart' | 'premium';

export interface PlanBreakdown {
  basic: number;
  smart: number;
  premium: number;
}

export interface MonthlyEarning {
  monthlyEarning: number;
  seasonEarning: number;  // total from paid months in current season
  referralBonus: number;
  total: number;
}

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const COMMISSION_RULES = {
  TIER_MONTHLY_AMOUNTS: { basic: 20, smart: 40, premium: 60 } as Record<PlanTier, number>,
  MILESTONE_LADDER: [
    { consumers: 5, amount: 150 },
    { consumers: 10, amount: 200 },
    { consumers: 15, amount: 250 },
    { consumers: 20, amount: 400 },
    // Cumulative â‚¹1000 as described
  ],
  MIN_PAYOUT: 200,
  REFERRAL_BONUS: 100,       // per referred supplier who stays active 2 months
  REFERRAL_GATE_MONTHS: 2,   // required consecutive paid months to unlock cashback
} as const;

// â”€â”€ Earning Calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate supplier earnings based on consumer count, plans, active months, and referrals.
 */
export function calculateSupplierEarnings(
  consumerCount: number,
  planBreakdown: PlanBreakdown,
  monthsActive: number,
  suppliersReferred: number,
): MonthlyEarning {
  const { TIER_MONTHLY_AMOUNTS, MILESTONE_LADDER, REFERRAL_BONUS, REFERRAL_GATE_MONTHS, MIN_PAYOUT } = COMMISSION_RULES;

  // Base monthly earning from consumer plans
  const monthlyEarning =
    planBreakdown.basic * TIER_MONTHLY_AMOUNTS.basic +
    planBreakdown.smart * TIER_MONTHLY_AMOUNTS.smart +
    planBreakdown.premium * TIER_MONTHLY_AMOUNTS.premium;

  // Milestone bonus (one-time per milestone; cumulative top-up)
  let milestoneBonus = 0;
  for (const m of MILESTONE_LADDER) {
    if (consumerCount >= m.consumers) {
      milestoneBonus += m.amount;
    }
  }

  // Season earning: monthly earning * monthsActive + milestone bonus
  const seasonEarning = monthlyEarning * monthsActive + milestoneBonus;

  // Referral bonus only if the referred suppliers have completed the gate months
  // (We assume all referred suppliers have met the 2-month gate)
  const referralBonus = suppliersReferred * REFERRAL_BONUS * Math.min(monthsActive, REFERRAL_GATE_MONTHS);

  let total = seasonEarning + referralBonus;
  if (total < MIN_PAYOUT) total = 0; // Minimum payout rule

  return {
    monthlyEarning,
    seasonEarning,
    referralBonus,
    total,
  };
}
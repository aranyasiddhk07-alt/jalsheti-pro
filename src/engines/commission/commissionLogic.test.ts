import { describe, it, expect } from 'vitest';
import { calculateSupplierEarnings, COMMISSION_RULES, type PlanBreakdown } from './commissionLogic';

describe('commissionLogic', () => {
  const basicPlan: PlanBreakdown = { basic: 20, smart: 0, premium: 0 };
  const mixedPlan: PlanBreakdown = { basic: 10, smart: 5, premium: 5 };
  const emptyPlan: PlanBreakdown = { basic: 0, smart: 0, premium: 0 };

  describe('COMMISSION_RULES constants', () => {
    it('should have correct tier amounts', () => {
      expect(COMMISSION_RULES.TIER_MONTHLY_AMOUNTS.basic).toBe(20);
      expect(COMMISSION_RULES.TIER_MONTHLY_AMOUNTS.smart).toBe(40);
      expect(COMMISSION_RULES.TIER_MONTHLY_AMOUNTS.premium).toBe(60);
    });

    it('should have correct milestone ladder', () => {
      expect(COMMISSION_RULES.MILESTONE_LADDER).toHaveLength(4);
      expect(COMMISSION_RULES.MILESTONE_LADDER[0].consumers).toBe(5);
      expect(COMMISSION_RULES.MILESTONE_LADDER[0].amount).toBe(150);
      expect(COMMISSION_RULES.MILESTONE_LADDER[3].consumers).toBe(20);
      expect(COMMISSION_RULES.MILESTONE_LADDER[3].amount).toBe(400);
    });

    it('should have minimum payout of 200', () => {
      expect(COMMISSION_RULES.MIN_PAYOUT).toBe(200);
    });

    it('should have referral gate of 2 months', () => {
      expect(COMMISSION_RULES.REFERRAL_GATE_MONTHS).toBe(2);
    });
  });

  describe('calculateSupplierEarnings', () => {
    it('should calculate basic monthly earning for 20 basic consumers', () => {
      const result = calculateSupplierEarnings(20, basicPlan, 1, 0);
      expect(result.monthlyEarning).toBe(400); // 20 * 20
    });

    it('should calculate mixed plan monthly earning correctly', () => {
      const result = calculateSupplierEarnings(20, mixedPlan, 1, 0);
      expect(result.monthlyEarning).toBe(10 * 20 + 5 * 40 + 5 * 60); // 200 + 200 + 300 = 700
    });

    it('should calculate zero monthly earning for empty plan', () => {
      const result = calculateSupplierEarnings(0, emptyPlan, 1, 0);
      expect(result.monthlyEarning).toBe(0);
    });

    it('should calculate season earning over 5 months with milestones', () => {
      const result = calculateSupplierEarnings(20, basicPlan, 5, 0);
      const milestoneBonus = 150 + 200 + 250 + 400; // = 1000
      expect(result.seasonEarning).toBe(400 * 5 + milestoneBonus); // 2000 + 1000 = 3000
    });

    it('should calculate partial milestones for 10 consumers', () => {
      const result = calculateSupplierEarnings(10, { basic: 10, smart: 0, premium: 0 }, 1, 0);
      const milestoneBonus = 150 + 200; // 5 and 10 thresholds
      expect(result.seasonEarning).toBe(200 + milestoneBonus); // 200 + 350 = 550
    });

    it('should calculate no milestones for 4 consumers', () => {
      const result = calculateSupplierEarnings(4, { basic: 4, smart: 0, premium: 0 }, 1, 0);
      expect(result.seasonEarning).toBe(80); // 4*20=80, no milestones
    });

    it('should calculate referral bonus for 1 referred supplier over 2 months', () => {
      const result = calculateSupplierEarnings(20, basicPlan, 2, 1);
      expect(result.referralBonus).toBe(100 * 2); // 100 * min(2, 2) = 200
    });

    it('should cap referral bonus at gate months', () => {
      const result = calculateSupplierEarnings(20, basicPlan, 5, 1);
      expect(result.referralBonus).toBe(100 * 2); // capped at 2 months
    });

    it('should return 0 total when below minimum payout', () => {
      const result = calculateSupplierEarnings(1, { basic: 1, smart: 0, premium: 0 }, 1, 0);
      // monthlyEarning = 20, milestones = 0, seasonEarning = 20, referralBonus = 0, total = 20 < 200
      expect(result.total).toBe(0);
    });

    it('should return correct total for 20-consumer node over 5-month season', () => {
      const result = calculateSupplierEarnings(20, basicPlan, 5, 1);
      const expectedSeason = 400 * 5 + 1000; // 3000
      const expectedReferral = 200; // 100 * min(5, 2)
      expect(result.total).toBe(expectedSeason + expectedReferral);
    });
  });
});

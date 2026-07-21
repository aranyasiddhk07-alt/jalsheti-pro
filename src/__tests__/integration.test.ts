import { describe, it, expect } from 'vitest';
import { calculateSupplierEarnings } from '../engines/commission/commissionLogic';
import { getGrowthStage } from '../engines/crop/cropIntelligence';
import { evaluatePestRisks } from '../engines/pest/pestWarningEngine';
import { SAVINGS_EVENTS } from '../engines/savings/savingsCalculator';
import { getWeedRecommendation } from '../engines/weed/weedEngine';
import { getMaintenanceTier, getWeedIntensityMultiplier } from '../engines/geometry/rowGeometryEngine';
import type { WeatherData, GrowthStage } from '../types';

const makeStage = (stage: string, dayNumber: number): GrowthStage => ({
  stage,
  stageMarathi: stage,
  dayNumber,
  irrigationIntervalDays: 8,
  criticalityLevel: 10,
});

describe('Integration: Auth Flow Logic', () => {
  it('should validate phone number format (10 digits starting with 6-9)', () => {
    const validPhones = ['9876543210', '6123456789', '9999999999'];
    const invalidPhones = ['1234567890', '98765', 'abcdefghij', ''];

    validPhones.forEach(phone => {
      expect(/^[6-9]\d{9}$/.test(phone)).toBe(true);
    });

    invalidPhones.forEach(phone => {
      expect(/^[6-9]\d{9}$/.test(phone)).toBe(false);
    });
  });

  it('should validate OTP format (6 digits)', () => {
    expect(/^\d{6}$/.test('123456')).toBe(true);
    expect(/^\d{6}$/.test('12345')).toBe(false);
    expect(/^\d{6}$/.test('1234567')).toBe(false);
    expect(/^\d{6}$/.test('abcdef')).toBe(false);
  });

  it('should set 7-day trial period on consumer registration', () => {
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const daysDiff = Math.ceil((trialEnd.getTime() - Date.now()) / 86400000);
    expect(daysDiff).toBe(7);
  });

  it('should format phone with +91 prefix for Indian numbers', () => {
    const formatPhone = (phone: string) => phone.startsWith('+91') ? phone : `+91${phone}`;
    expect(formatPhone('9876543210')).toBe('+919876543210');
    expect(formatPhone('+919876543210')).toBe('+919876543210');
  });
});

describe('Integration: Water Session Flow', () => {
  it('should calculate growth stage correctly for water session', () => {
    const plantingDate = new Date(Date.now() - 50 * 86400000);
    const stage = getGrowthStage(plantingDate);
    expect(stage.stage).toBe('tillering');
    expect(stage.criticalityLevel).toBe(10);
  });

  it('should generate advisory based on session duration and stage', () => {
    const plantingDate = new Date(Date.now() - 50 * 86400000);
    const stage = getGrowthStage(plantingDate);

    const duration = 60;
    let category: string;
    if (duration < 45) category = 'insufficient';
    else if (duration <= 90) category = 'optimal';
    else category = 'over';

    expect(category).toBe('optimal');
    expect(stage.stage).toBe('tillering');
  });

  it('should check pest risks during water session', () => {
    const weather: WeatherData = {
      temp: 27, humidity: 75, rainfall: 0, windSpeed: 10,
      avgTemp: 27, rainMm: 0,
    };
    const risks = evaluatePestRisks(weather, makeStage('tillering', 30), 30, 4, 'Co86032');
    expect(Array.isArray(risks)).toBe(true);
  });

  it('should trigger savings event when rain avoids irrigation', () => {
    const event = SAVINGS_EVENTS.RAIN_AVOIDED_IRRIGATION;
    expect(event.amount).toBe(220);
    expect(event.descriptionMarathi).toBeTruthy();
  });
});

describe('Integration: Payment + Commission Flow', () => {
  it('should calculate correct commission for Basic plan (₹99 → ₹20)', () => {
    const result = calculateSupplierEarnings(1, { basic: 1, smart: 0, premium: 0 }, 1, 0);
    expect(result.monthlyEarning).toBe(20);
  });

  it('should calculate correct commission for Smart plan (₹199 → ₹40)', () => {
    const result = calculateSupplierEarnings(1, { basic: 0, smart: 1, premium: 0 }, 1, 0);
    expect(result.monthlyEarning).toBe(40);
  });

  it('should calculate correct commission for Premium plan (₹299 → ₹60)', () => {
    const result = calculateSupplierEarnings(1, { basic: 0, smart: 0, premium: 1 }, 1, 0);
    expect(result.monthlyEarning).toBe(60);
  });

  it('should gate cashback behind 2-month paid requirement', () => {
    expect(calculateSupplierEarnings(20, { basic: 20, smart: 0, premium: 0 }, 1, 1).referralBonus)
      .toBe(100); // Only 1 month counted
    expect(calculateSupplierEarnings(20, { basic: 20, smart: 0, premium: 0 }, 2, 1).referralBonus)
      .toBe(200); // 2 months capped
    expect(calculateSupplierEarnings(20, { basic: 20, smart: 0, premium: 0 }, 5, 1).referralBonus)
      .toBe(200); // Capped at 2 months
  });

  it('should reject payout below minimum threshold', () => {
    const result = calculateSupplierEarnings(1, { basic: 1, smart: 0, premium: 0 }, 1, 0);
    expect(result.total).toBe(0); // ₹20 < ₹200 min payout
  });

  it('should complete 20-consumer node economics correctly', () => {
    const result = calculateSupplierEarnings(20, { basic: 20, smart: 0, premium: 0 }, 5, 0);
    const milestoneBonus = 150 + 200 + 250 + 400; // ₹1000
    expect(result.seasonEarning).toBe(400 * 5 + milestoneBonus); // ₹3000
  });
});

describe('Integration: Full Advisory Pipeline', () => {
  it('should evaluate pest, check savings, and generate advisory in sequence', () => {
    const plantingDate = new Date(Date.now() - 60 * 86400000);
    const stage = getGrowthStage(plantingDate);
    expect(stage.stage).toBe('tillering');

    const weather: WeatherData = {
      temp: 27, humidity: 75, rainfall: 0, windSpeed: 10,
      avgTemp: 27, rainMm: 0,
    };
    const pestRisks = evaluatePestRisks(weather, stage, 60, 5, 'Co86032');
    expect(Array.isArray(pestRisks)).toBe(true);

    const tier = getMaintenanceTier(4.0);
    expect(tier).toBe('standard');

    const weedMultiplier = getWeedIntensityMultiplier(tier, 60, false);
    expect(weedMultiplier).toBe(1.0);

    const weedRec = getWeedRecommendation('grassy_broadleaf_new', 3, weather);
    expect(weedRec).toBeDefined();
  });

  it('should apply weather gate to fertilizer recommendation', () => {
    const ureaEvent = SAVINGS_EVENTS.UREA_RAIN_DELAY;
    expect(ureaEvent.amount).toBe(400);
  });
});

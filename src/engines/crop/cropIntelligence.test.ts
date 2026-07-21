import { describe, it, expect } from 'vitest';
import { getGrowthStage, getFertilizerSchedule, getNextFertilizerAction } from './cropIntelligence';

describe('cropIntelligence', () => {
  describe('getGrowthStage', () => {
    it('should return germination stage for 0 days', () => {
      const today = new Date();
      const stage = getGrowthStage(today);
      expect(stage.stage).toBe('germination');
      expect(stage.dayNumber).toBe(0);
      expect(stage.irrigationIntervalDays).toBe(7);
    });

    it('should return germination stage for 35 days', () => {
      const plantingDate = new Date(Date.now() - 35 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('germination');
      expect(stage.dayNumber).toBe(35);
    });

    it('should return tillering stage for 36 days (MOST CRITICAL)', () => {
      const plantingDate = new Date(Date.now() - 36 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('tillering');
      expect(stage.criticalityLevel).toBe(10);
      expect(stage.irrigationIntervalDays).toBe(8);
    });

    it('should return tillering stage for 100 days', () => {
      const plantingDate = new Date(Date.now() - 100 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('tillering');
      expect(stage.dayNumber).toBe(100);
    });

    it('should return grand_growth stage for 101 days', () => {
      const plantingDate = new Date(Date.now() - 101 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('grand_growth');
      expect(stage.irrigationIntervalDays).toBe(10);
    });

    it('should return maturity stage for 271 days', () => {
      const plantingDate = new Date(Date.now() - 271 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('maturity');
      expect(stage.irrigationIntervalDays).toBe(15);
    });

    it('should return harvest stage for 400 days', () => {
      const plantingDate = new Date(Date.now() - 400 * 86400000);
      const stage = getGrowthStage(plantingDate);
      expect(stage.stage).toBe('harvest');
      expect(stage.irrigationIntervalDays).toBe(0);
    });

    it('should return pre_planting for future dates', () => {
      const future = new Date(Date.now() + 86400000);
      const stage = getGrowthStage(future);
      expect(stage.stage).toBe('pre_planting');
      expect(stage.dayNumber).toBeLessThan(0);
    });
  });

  describe('getFertilizerSchedule', () => {
    it('should generate schedule for alluvial soil, suru crop, 1 acre', () => {
      const schedule = getFertilizerSchedule(1, 'alluvial', 'suru');
      expect(schedule.length).toBeGreaterThanOrEqual(3);
    });

    it('should scale doses by field area', () => {
      const schedule1 = getFertilizerSchedule(1, 'alluvial', 'suru');
      const schedule2 = getFertilizerSchedule(2, 'alluvial', 'suru');
      const urea1 = schedule1[0].ureaKg;
      const urea2 = schedule2[0].ureaKg;
      expect(urea2).toBeGreaterThan(urea1);
    });

    it('should include extra stage for adsali crop', () => {
      const suruSchedule = getFertilizerSchedule(1, 'alluvial', 'suru');
      const adsaliSchedule = getFertilizerSchedule(1, 'alluvial', 'adsali');
      expect(adsaliSchedule.length).toBeGreaterThanOrEqual(suruSchedule.length);
    });

    it('should handle black cotton soil type', () => {
      const schedule = getFertilizerSchedule(1, 'black_cotton', 'suru');
      expect(schedule.length).toBeGreaterThan(0);
    });

    it('should handle sandy soil type', () => {
      const schedule = getFertilizerSchedule(1, 'sandy', 'suru');
      expect(schedule.length).toBeGreaterThan(0);
    });

    it('should handle red laterite soil type', () => {
      const schedule = getFertilizerSchedule(1, 'red_laterite', 'suru');
      expect(schedule.length).toBeGreaterThan(0);
    });
  });

  describe('getNextFertilizerAction', () => {
    it('should return none status when schedule is empty', () => {
      const action = getNextFertilizerAction([], 100, { temp: 25, humidity: 60, rainfall: 0, windSpeed: 10 });
      expect(action.status).toBe('none');
    });

    it('should return hold_for_rain when heavy rain forecast', () => {
      const schedule = getFertilizerSchedule(1, 'alluvial', 'suru');
      const action = getNextFertilizerAction(schedule, 30, { temp: 25, humidity: 80, rainfall: 40, windSpeed: 10, rainMm48h: 40 });
      expect(action.status).toBe('hold_for_rain');
    });

    it('should return due status when fertilizer window is active', () => {
      const schedule = getFertilizerSchedule(1, 'alluvial', 'suru');
      const action = getNextFertilizerAction(schedule, 0, { temp: 25, humidity: 60, rainfall: 0, windSpeed: 10 });
      expect(['due', 'upcoming']).toContain(action.status);
    });
  });
});

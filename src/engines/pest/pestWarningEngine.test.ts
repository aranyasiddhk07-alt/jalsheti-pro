import { describe, it, expect } from 'vitest';
import { evaluatePestRisks, getVarietyRiskMultiplier } from './pestWarningEngine';
import type { WeatherData, GrowthStage } from '../../types';

const makeStage = (stage: string, dayNumber: number): GrowthStage => ({
  stage,
  stageMarathi: stage,
  dayNumber,
  irrigationIntervalDays: 8,
  criticalityLevel: 10,
});

const clearWeather: WeatherData = { temp: 28, humidity: 50, rainfall: 0, windSpeed: 10, avgTemp: 28, rainMm: 0 };
const esbWeather: WeatherData = { temp: 27, humidity: 75, rainfall: 0, windSpeed: 10, avgTemp: 27, rainMm: 0 };
const heavyRain: WeatherData = { temp: 25, humidity: 90, rainfall: 60, windSpeed: 15, avgTemp: 25, rainMm: 60 };
const hotWeather: WeatherData = { temp: 32, humidity: 60, rainfall: 0, windSpeed: 8, avgTemp: 32, rainMm: 0 };

describe('pestWarningEngine', () => {
  describe('getVarietyRiskMultiplier', () => {
    it('should return correct multipliers for Co86032', () => {
      expect(getVarietyRiskMultiplier('Co86032', 'redRot')).toBe(0.6);
      expect(getVarietyRiskMultiplier('Co86032', 'smut')).toBe(0.5);
      expect(getVarietyRiskMultiplier('Co86032', 'wilt')).toBe(0.7);
    });

    it('should return correct multipliers for Co0238 (HIGH RISK)', () => {
      expect(getVarietyRiskMultiplier('Co0238', 'redRot')).toBe(1.8);
      expect(getVarietyRiskMultiplier('Co0238', 'topBorer')).toBe(1.6);
      expect(getVarietyRiskMultiplier('Co0238', 'wilt')).toBe(1.3);
    });

    it('should return 1.0 for unknown variety/disease combinations', () => {
      expect(getVarietyRiskMultiplier('Unknown', 'redRot')).toBe(1.0);
      expect(getVarietyRiskMultiplier('Co86032', 'topBorer')).toBe(1.0);
    });
  });

  describe('evaluatePestRisks', () => {
    it('should return empty array when no conditions are met', () => {
      const risks = evaluatePestRisks(clearWeather, makeStage('germination', 5), 5, 1, 'Co86032');
      expect(risks).toHaveLength(0);
    });

    it('should detect Early Shoot Borer risk in correct conditions', () => {
      const risks = evaluatePestRisks(esbWeather, makeStage('tillering', 30), 30, 4, 'Co86032');
      const esb = risks.find(r => r.pestName.toLowerCase().includes('shoot borer'));
      expect(esb).toBeDefined();
    });

    it('should detect Red Rot risk with heavy rain and high humidity', () => {
      const risks = evaluatePestRisks(heavyRain, makeStage('grand_growth', 100), 100, 7, 'Co86032');
      const redRot = risks.find(r => r.pestName.toLowerCase().includes('red rot'));
      expect(redRot).toBeDefined();
    });

    it('should detect Internode Borer for crop > 120 days with high temp', () => {
      const risks = evaluatePestRisks(hotWeather, makeStage('grand_growth', 130), 130, 6, 'Co86032');
      const ib = risks.find(r => r.pestName.toLowerCase().includes('internode'));
      expect(ib).toBeDefined();
    });

    it('should include confidence score in each risk', () => {
      const risks = evaluatePestRisks(esbWeather, makeStage('tillering', 30), 30, 4, 'Co86032');
      risks.forEach(r => {
        expect(r.confidence).toBeGreaterThanOrEqual(0);
        expect(r.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should include Marathi advisory text', () => {
      const risks = evaluatePestRisks(esbWeather, makeStage('tillering', 30), 30, 4, 'Co86032');
      risks.forEach(r => {
        expect(r.pestNameMarathi).toBeTruthy();
        expect(r.advisory).toBeTruthy();
      });
    });
  });
});

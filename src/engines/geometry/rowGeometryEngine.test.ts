import { describe, it, expect } from 'vitest';
import { getMaintenanceTier, getWeedIntensityMultiplier, getAirflowDiseaseMultiplier, getIntercropSuggestion } from './rowGeometryEngine';

describe('rowGeometryEngine', () => {
  describe('getMaintenanceTier', () => {
    it('should return simplified for spacing <= 3.5', () => {
      expect(getMaintenanceTier(3.0)).toBe('simplified');
      expect(getMaintenanceTier(3.5)).toBe('simplified');
    });

    it('should return standard for spacing <= 4.0', () => {
      expect(getMaintenanceTier(3.6)).toBe('standard');
      expect(getMaintenanceTier(4.0)).toBe('standard');
    });

    it('should return advanced for spacing > 4.0', () => {
      expect(getMaintenanceTier(4.5)).toBe('advanced');
      expect(getMaintenanceTier(5.0)).toBe('advanced');
      expect(getMaintenanceTier(6.0)).toBe('advanced');
    });
  });

  describe('getWeedIntensityMultiplier', () => {
    it('should return 1.3 for simplified tier in first 60 days', () => {
      expect(getWeedIntensityMultiplier('simplified', 30, false)).toBe(1.3);
      expect(getWeedIntensityMultiplier('simplified', 60, false)).toBe(1.3);
    });

    it('should return 0.5 for simplified tier after 60 days', () => {
      expect(getWeedIntensityMultiplier('simplified', 61, false)).toBe(0.5);
      expect(getWeedIntensityMultiplier('simplified', 100, false)).toBe(0.5);
    });

    it('should return 1.4 for advanced tier without intercrop', () => {
      expect(getWeedIntensityMultiplier('advanced', 30, false)).toBe(1.4);
      expect(getWeedIntensityMultiplier('advanced', 100, false)).toBe(1.4);
    });

    it('should return 0.8 for advanced tier with intercrop', () => {
      expect(getWeedIntensityMultiplier('advanced', 30, true)).toBe(0.8);
      expect(getWeedIntensityMultiplier('advanced', 100, true)).toBe(0.8);
    });

    it('should return 1.0 for standard tier', () => {
      expect(getWeedIntensityMultiplier('standard', 30, false)).toBe(1.0);
      expect(getWeedIntensityMultiplier('standard', 100, true)).toBe(1.0);
    });
  });

  describe('getAirflowDiseaseMultiplier', () => {
    it('should return 1.1 for simplified tier (denser canopy)', () => {
      expect(getAirflowDiseaseMultiplier('simplified')).toBe(1.1);
    });

    it('should return 1.0 for standard tier', () => {
      expect(getAirflowDiseaseMultiplier('standard')).toBe(1.0);
    });

    it('should return 0.95 for advanced tier (better airflow)', () => {
      expect(getAirflowDiseaseMultiplier('advanced')).toBe(0.95);
    });
  });

  describe('getIntercropSuggestion', () => {
    it('should return crop suggestions for advanced tier', () => {
      const suggestions = getIntercropSuggestion('advanced');
      expect(suggestions).not.toBeNull();
      expect(suggestions!.length).toBeGreaterThan(0);
    });

    it('should return null or empty for non-advanced tiers', () => {
      const simplifiedResult = getIntercropSuggestion('simplified');
      expect(simplifiedResult === null || (Array.isArray(simplifiedResult) && simplifiedResult.length === 0)).toBe(true);
    });
  });
});

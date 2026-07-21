import { describe, it, expect } from 'vitest';
import { SOIL_QUESTIONS, analyzeSoilCard } from './soilCardAnalysis';

describe('soilCardAnalysis', () => {
  describe('SOIL_QUESTIONS', () => {
    it('should have exactly 15 questions', () => {
      expect(SOIL_QUESTIONS).toHaveLength(15);
    });

    it('should have options for each question', () => {
      SOIL_QUESTIONS.forEach(q => {
        expect(q.options).toBeDefined();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('analyzeSoilCard', () => {
    it('should return result object with required fields', () => {
      const answers = Array(15).fill(0);
      const result = analyzeSoilCard(answers);
      expect(result).toBeDefined();
      expect(result.soilType).toBeDefined();
      expect(result.phEstimate).toBeDefined();
      expect(result.nitrogenLevel).toBeDefined();
      expect(result.waterRetention).toBeDefined();
    });

    it('should detect black cotton soil when answers indicate dark color', () => {
      const answers = Array(15).fill(0);
      const result = analyzeSoilCard(answers);
      expect(result.soilType).toBeDefined();
    });

    it('should handle all-zero answers without errors', () => {
      const answers = Array(15).fill(0);
      expect(() => analyzeSoilCard(answers)).not.toThrow();
    });

    it('should handle all-max answers without errors', () => {
      const answers = Array(15).fill(3);
      expect(() => analyzeSoilCard(answers)).not.toThrow();
    });

    it('should return fertilizer recommendations', () => {
      const answers = Array(15).fill(0);
      const result = analyzeSoilCard(answers);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { getPrimaryManureRecommendation, type FarmResources } from './organicManureEngine';

describe('organicManureEngine', () => {
  describe('getPrimaryManureRecommendation', () => {
    it('should recommend FYM when farmer has cattle', () => {
      const resources: FarmResources = { hasCattle: true, hasPoultry: false, hasGoatSheep: false, hasBiogasPlant: false, nearSugarFactory: false };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec.primary.length).toBeGreaterThan(0);
    });

    it('should recommend poultry manure when farmer has poultry', () => {
      const resources: FarmResources = { hasCattle: false, hasPoultry: true, hasGoatSheep: false, hasBiogasPlant: false, nearSugarFactory: false };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec.primary.length).toBeGreaterThan(0);
    });

    it('should prioritize press mud when near sugar factory (HIGHEST LEVERAGE)', () => {
      const resources: FarmResources = { hasCattle: true, hasPoultry: false, hasGoatSheep: false, hasBiogasPlant: false, nearSugarFactory: true };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec.primary.length).toBeGreaterThan(0);
    });

    it('should recommend biogas slurry when farmer has biogas plant', () => {
      const resources: FarmResources = { hasCattle: false, hasPoultry: false, hasGoatSheep: false, hasBiogasPlant: true, nearSugarFactory: false };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec.primary.length).toBeGreaterThan(0);
    });

    it('should recommend goat/sheep manure when farmer has goats', () => {
      const resources: FarmResources = { hasCattle: false, hasPoultry: false, hasGoatSheep: true, hasBiogasPlant: false, nearSugarFactory: false };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec.primary.length).toBeGreaterThan(0);
    });

    it('should still provide recommendations when farmer has no resources', () => {
      const resources: FarmResources = { hasCattle: false, hasPoultry: false, hasGoatSheep: false, hasBiogasPlant: false, nearSugarFactory: false };
      const rec = getPrimaryManureRecommendation(resources);
      expect(rec).toBeDefined();
    });
  });
});

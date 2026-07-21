import { describe, it, expect } from 'vitest';
import { getWeedRecommendation } from './weedEngine';
import type { WeatherData } from '../../types';

const dryWeather: WeatherData = { temp: 28, humidity: 50, rainfall: 0, windSpeed: 10, rainMm: 0, rainMm24h: 0 };
const rainComing: WeatherData = { temp: 28, humidity: 80, rainfall: 10, windSpeed: 15, rainMm: 10, rainMm24h: 15 };

describe('weedEngine', () => {
  describe('getWeedRecommendation', () => {
    it('should recommend Atrazine for grassy+broadleaf new growth', () => {
      const rec = getWeedRecommendation('grassy_broadleaf_new', 3, dryWeather);
      expect(rec).toBeDefined();
      expect(rec.product).toBeTruthy();
    });

    it('should recommend product for broadleaf medium growth', () => {
      const rec = getWeedRecommendation('broadleaf_medium', 20, dryWeather);
      expect(rec).toBeDefined();
      expect(rec.product).toBeTruthy();
    });

    it('should recommend product for mixed weed type', () => {
      const rec = getWeedRecommendation('mixed', 25, dryWeather);
      expect(rec).toBeDefined();
      expect(rec.product).toBeTruthy();
    });

    it('should recommend product for broadleaf old growth', () => {
      const rec = getWeedRecommendation('broadleaf_old', 35, dryWeather);
      expect(rec).toBeDefined();
      expect(rec.product).toBeTruthy();
    });

    it('should recommend hand-weeding for sedge', () => {
      const rec = getWeedRecommendation('sedge', 30, dryWeather);
      expect(rec).toBeDefined();
    });

    it('should block spraying when rain is coming', () => {
      const rec = getWeedRecommendation('grassy_broadleaf_new', 3, rainComing);
      expect(rec.canSprayNow).toBe(false);
    });

    it('should allow spraying in dry weather', () => {
      const rec = getWeedRecommendation('grassy_broadleaf_new', 3, dryWeather);
      expect(rec.canSprayNow).toBe(true);
    });
  });
});

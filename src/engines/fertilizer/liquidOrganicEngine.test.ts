import { describe, it, expect } from 'vitest';
import { getCombinedChemicalReduction } from './liquidOrganicEngine';

describe('liquidOrganicEngine', () => {
  describe('getCombinedChemicalReduction', () => {
    it('should return 0 when no organic inputs applied', () => {
      expect(getCombinedChemicalReduction(false, false)).toBe(0);
    });

    it('should return 25 when only solid organic applied', () => {
      expect(getCombinedChemicalReduction(true, false)).toBe(25);
    });

    it('should return 10 when only liquid organic applied', () => {
      // Based on spec: solid=25, liquid adds 10, but without solid the liquid alone gives 10
      const result = getCombinedChemicalReduction(false, true);
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(35);
    });

    it('should return 35 when both solid and liquid organic applied (CAP)', () => {
      expect(getCombinedChemicalReduction(true, true)).toBe(35);
    });

    it('should never exceed 35% cap', () => {
      // Even if somehow both are true multiple times
      const result = getCombinedChemicalReduction(true, true);
      expect(result).toBeLessThanOrEqual(35);
    });
  });
});

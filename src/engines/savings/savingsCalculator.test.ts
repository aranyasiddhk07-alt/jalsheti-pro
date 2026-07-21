import { describe, it, expect } from 'vitest';
import { calculateTotalSavings, SAVINGS_EVENTS, type SavingsLogEntry } from './savingsCalculator';

describe('savingsCalculator', () => {
  describe('SAVINGS_EVENTS constants', () => {
    it('should have exactly 8 event types', () => {
      expect(Object.keys(SAVINGS_EVENTS)).toHaveLength(8);
    });

    it('should have correct amounts for each event', () => {
      expect(SAVINGS_EVENTS.RAIN_AVOIDED_IRRIGATION.amount).toBe(220);
      expect(SAVINGS_EVENTS.CORRECT_FERTILIZER_TIMING.amount).toBe(800);
      expect(SAVINGS_EVENTS.PEST_WARNING_ACTED.amount).toBe(15000);
      expect(SAVINGS_EVENTS.OPTIMAL_IRRIGATION.amount).toBe(180);
      expect(SAVINGS_EVENTS.UREA_RAIN_DELAY.amount).toBe(400);
      expect(SAVINGS_EVENTS.HERBICIDE_RAIN_DELAY.amount).toBe(200);
      expect(SAVINGS_EVENTS.INSURANCE_CLAIM_DOCUMENTED.amount).toBe(0);
      expect(SAVINGS_EVENTS.GOVT_SCHEME_CLAIMED.amount).toBe(2000);
    });

    it('should have Marathi descriptions for each event', () => {
      Object.values(SAVINGS_EVENTS).forEach(event => {
        expect(event.descriptionMarathi).toBeTruthy();
        expect(event.descriptionMarathi.length).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateTotalSavings', () => {
    it('should return 0 for empty log', () => {
      expect(calculateTotalSavings([])).toBe(0);
    });

    it('should calculate single event correctly', () => {
      const log: SavingsLogEntry[] = [{ eventKey: 'RAIN_AVOIDED_IRRIGATION', date: new Date() }];
      expect(calculateTotalSavings(log)).toBe(220);
    });

    it('should sum multiple events correctly', () => {
      const log: SavingsLogEntry[] = [
        { eventKey: 'RAIN_AVOIDED_IRRIGATION', date: new Date() },
        { eventKey: 'OPTIMAL_IRRIGATION', date: new Date() },
        { eventKey: 'UREA_RAIN_DELAY', date: new Date() },
      ];
      expect(calculateTotalSavings(log)).toBe(220 + 180 + 400);
    });

    it('should handle unknown event keys gracefully', () => {
      const log: SavingsLogEntry[] = [
        { eventKey: 'UNKNOWN_EVENT', date: new Date() },
        { eventKey: 'RAIN_AVOIDED_IRRIGATION', date: new Date() },
      ];
      expect(calculateTotalSavings(log)).toBe(220);
    });

    it('should handle insurance claim with 0 amount', () => {
      const log: SavingsLogEntry[] = [{ eventKey: 'INSURANCE_CLAIM_DOCUMENTED', date: new Date() }];
      expect(calculateTotalSavings(log)).toBe(0);
    });

    it('should calculate large total with all events', () => {
      const log: SavingsLogEntry[] = [
        { eventKey: 'RAIN_AVOIDED_IRRIGATION', date: new Date() },
        { eventKey: 'CORRECT_FERTILIZER_TIMING', date: new Date() },
        { eventKey: 'PEST_WARNING_ACTED', date: new Date() },
        { eventKey: 'OPTIMAL_IRRIGATION', date: new Date() },
        { eventKey: 'UREA_RAIN_DELAY', date: new Date() },
        { eventKey: 'HERBICIDE_RAIN_DELAY', date: new Date() },
        { eventKey: 'GOVT_SCHEME_CLAIMED', date: new Date() },
      ];
      const expected = 220 + 800 + 15000 + 180 + 400 + 200 + 2000;
      expect(calculateTotalSavings(log)).toBe(expected);
    });
  });
});

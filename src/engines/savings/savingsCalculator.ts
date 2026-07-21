/**
 * Savings Calculator
 * Aggregates savings events into total rupees saved.
 */

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SavingsEvent {
  eventKey: string;
  amount: number;  // â‚¹
  descriptionMarathi: string;
}

export interface SavingsLogEntry {
  eventKey: string;
  date: Date;
  farmerId?: string;
}

// â”€â”€ Event Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const SAVINGS_EVENTS: Record<string, SavingsEvent> = {
  RAIN_AVOIDED_IRRIGATION: {
    eventKey: 'RAIN_AVOIDED_IRRIGATION',
    amount: 220,
    descriptionMarathi: 'à¤ªà¤¾à¤µà¤¸à¤¾à¤®à¥à¤³à¥‡ à¤¸à¤¿à¤‚à¤šà¤¨ à¤Ÿà¤¾à¤³à¤²à¥‡',
  },
  CORRECT_FERTILIZER_TIMING: {
    eventKey: 'CORRECT_FERTILIZER_TIMING',
    amount: 800,
    descriptionMarathi: 'à¤¯à¥‹à¤—à¥à¤¯ à¤µà¥‡à¤³à¥€ à¤–à¤¤ à¤¦à¤¿à¤²à¥à¤¯à¤¾à¤¨à¥‡ à¤µà¤¾à¤šà¤²à¥‡à¤²à¥€ à¤°à¤•à¥à¤•à¤®',
  },
  PEST_WARNING_ACTED: {
    eventKey: 'PEST_WARNING_ACTED',
    amount: 15000,
    descriptionMarathi: 'à¤•à¥€à¤¡ à¤‡à¤¶à¤¾à¤°à¤¾ à¤…à¤¨à¥à¤¸à¤°à¥‚à¤¨ à¤ªà¥€à¤• à¤µà¤¾à¤šà¤µà¤¿à¤²à¥‡',
  },
  OPTIMAL_IRRIGATION: {
    eventKey: 'OPTIMAL_IRRIGATION',
    amount: 180,
    descriptionMarathi: 'à¤‡à¤·à¥à¤Ÿà¤¤à¤® à¤¸à¤¿à¤‚à¤šà¤¨à¤¾à¤®à¥à¤³à¥‡ à¤¬à¤šà¤¤',
  },
  UREA_RAIN_DELAY: {
    eventKey: 'UREA_RAIN_DELAY',
    amount: 400,
    descriptionMarathi: 'à¤ªà¤¾à¤µà¤¸à¤¾à¤®à¥à¤³à¥‡ à¤¯à¥à¤°à¤¿à¤¯à¤¾ à¤µà¤¾à¤ªà¤°à¤£à¥‡ à¤Ÿà¤¾à¤³à¤²à¥‡',
  },
  HERBICIDE_RAIN_DELAY: {
    eventKey: 'HERBICIDE_RAIN_DELAY',
    amount: 200,
    descriptionMarathi: 'à¤ªà¤¾à¤µà¤¸à¤¾à¤®à¥à¤³à¥‡ à¤¤à¤£à¤¨à¤¾à¤¶à¤• à¤«à¤µà¤¾à¤°à¤£à¥€ à¤Ÿà¤¾à¤³à¤²à¥€',
  },
  INSURANCE_CLAIM_DOCUMENTED: {
    eventKey: 'INSURANCE_CLAIM_DOCUMENTED',
    amount: 0, // savings not realised yet, but documentation may be valuable
    descriptionMarathi: 'à¤µà¤¿à¤®à¤¾ à¤¦à¤¾à¤µà¤¾ à¤¨à¥‹à¤‚à¤¦à¤µà¤¿à¤²à¤¾ (à¤°à¤•à¥à¤•à¤® à¤¨à¤‚à¤¤à¤° à¤®à¤¿à¤³à¥‡à¤²)',
  },
  GOVT_SCHEME_CLAIMED: {
    eventKey: 'GOVT_SCHEME_CLAIMED',
    amount: 2000,
    descriptionMarathi: 'à¤¶à¤¾à¤¸à¤•à¥€à¤¯ à¤¯à¥‹à¤œà¤¨à¥‡à¤šà¤¾ à¤²à¤¾à¤­ à¤®à¤¿à¤³à¤¾à¤²à¤¾',
  },
};

// â”€â”€ Calculation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate total savings in rupees from a log of savings events.
 */
export function calculateTotalSavings(savingsLog: SavingsLogEntry[]): number {
  return savingsLog.reduce((total, entry) => {
    const event = SAVINGS_EVENTS[entry.eventKey];
    return total + (event?.amount ?? 0);
  }, 0);
}
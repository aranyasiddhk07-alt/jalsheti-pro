/**
 * Soil Card Analysis Engine
 * Digital soil health card questionnaire and scoring logic.
 * No side effects. Pure computation based on farmer answers.
 */

import { SoilType } from './cropIntelligence';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SoilQuestion {
  id: number;
  textMarathi: string;
  options: { value: number; labelMarathi: string }[];
}

export interface SoilCardResult {
  soilType: SoilType;
  phEstimate: number;
  nitrogenLevel: 'low' | 'medium' | 'high';
  waterRetention: 'low' | 'medium' | 'high';
  recommendations: string[];
  fertilizerDosage: {
    ureaKgPerAcre: number;
    dapKgPerAcre: number;
    mopKgPerAcre: number;
    extraInfoMarathi: string;
  };
}

// â”€â”€ Questionnaire â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const SOIL_QUESTIONS: SoilQuestion[] = [
  {
    id: 1,
    textMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤šà¤¾ à¤°à¤‚à¤— à¤•à¤¸à¤¾ à¤†à¤¹à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤—à¤¡à¤¦ à¤•à¤¾à¤³à¤¾' },
      { value: 1, labelMarathi: 'à¤²à¤¾à¤²à¤¸à¤°' },
      { value: 2, labelMarathi: 'à¤ªà¤¿à¤µà¤³à¤¸à¤° / à¤•à¤°à¤¡à¤¾' },
      { value: 3, labelMarathi: 'à¤¤à¤ªà¤•à¤¿à¤°à¥€' },
    ],
  },
  {
    id: 2,
    textMarathi: 'à¤•à¥‹à¤°à¤¡à¥€ à¤…à¤¸à¤¤à¤¾à¤¨à¤¾ à¤œà¤®à¥€à¤¨ à¤•à¤¶à¥€ à¤µà¤¾à¤Ÿà¤¤à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤­à¥à¤¸à¤­à¥à¤¶à¥€à¤¤ (à¤ªà¤¾à¤µà¤¡à¤°)' },
      { value: 1, labelMarathi: 'à¤•à¤£à¤­à¤° (à¤µà¤¾à¤³à¥‚à¤®à¤¿à¤¶à¥à¤°à¤¿à¤¤)' },
      { value: 2, labelMarathi: 'à¤–à¤¡à¤•à¤¾à¤³ / à¤–à¤°à¤–à¤°à¥€à¤¤' },
      { value: 3, labelMarathi: 'à¤—à¥à¤ à¤³à¥à¤¯à¤¾à¤‚à¤®à¤§à¥à¤¯à¥‡' },
    ],
  },
  {
    id: 3,
    textMarathi: 'à¤“à¤²à¥€ à¤œà¤®à¥€à¤¨ à¤¹à¤¾à¤¤à¤¾à¤¤ à¤˜à¥‡à¤¤à¤²à¥à¤¯à¤¾à¤µà¤° à¤•à¤¶à¥€ à¤µà¤¾à¤Ÿà¤¤à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤šà¤¿à¤•à¤Ÿ à¤†à¤£à¤¿ à¤—à¥‹à¤³à¤¾ à¤¹à¥‹à¤¤à¥‡' },
      { value: 1, labelMarathi: 'à¤§à¥‚à¤¸à¤° à¤µà¤¾à¤Ÿà¤¤à¥‡' },
      { value: 2, labelMarathi: 'à¤˜à¤¸à¤˜à¤¶à¥€à¤¤ / à¤¸à¤¾à¤¬à¤£à¤¾à¤¸à¤¾à¤°à¤–à¥€' },
      { value: 3, labelMarathi: 'à¤–à¤°à¤–à¤°à¥€à¤¤ à¤°à¤¾à¤¹à¤¤à¥‡' },
    ],
  },
  {
    id: 4,
    textMarathi: 'à¤ªà¤¾à¤µà¤¸à¤¾à¤¨à¤‚à¤¤à¤° à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤­à¥‡à¤—à¤¾ à¤ªà¤¡à¤¤à¤¾à¤¤ à¤•à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤¹à¥‹, à¤®à¥‹à¤ à¥à¤¯à¤¾ à¤­à¥‡à¤—à¤¾ à¤ªà¤¡à¤¤à¤¾à¤¤' },
      { value: 1, labelMarathi: 'à¤²à¤¹à¤¾à¤¨ à¤­à¥‡à¤—à¤¾ à¤ªà¤¡à¤¤à¤¾à¤¤' },
      { value: 2, labelMarathi: 'à¤­à¥‡à¤—à¤¾ à¤ªà¤¡à¤¤ à¤¨à¤¾à¤¹à¥€à¤¤' },
      { value: 3, labelMarathi: 'à¤µà¤°à¤šà¤¾ à¤¥à¤° à¤¸à¥à¤•à¥‚à¤¨ à¤ªà¥‹à¤ªà¤¡à¤¾ à¤¨à¤¿à¤˜à¤¤à¥‹' },
    ],
  },
  {
    id: 5,
    textMarathi: 'à¤¶à¥‡à¤¤à¤¾à¤¤ à¤ªà¤¾à¤£à¥€ à¤¶à¤¿à¤°à¤²à¥à¤¯à¤¾à¤µà¤° à¤•à¤¿à¤¤à¥€ à¤µà¥‡à¤—à¤¾à¤¨à¥‡ à¤œà¤¿à¤°à¤¤à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤–à¥‚à¤ª à¤¹à¤³à¥‚ (à¤à¤• à¤¦à¤¿à¤µà¤¸à¤¾à¤ªà¥‡à¤•à¥à¤·à¤¾ à¤œà¤¾à¤¸à¥à¤¤)' },
      { value: 1, labelMarathi: 'à¤®à¤§à¥à¤¯à¤® (à¤•à¤¾à¤¹à¥€ à¤¤à¤¾à¤¸à¤¾à¤‚à¤¤)' },
      { value: 2, labelMarathi: 'à¤²à¤µà¤•à¤° (à¥§-à¥¨ à¤¤à¤¾à¤¸à¤¾à¤‚à¤¤)' },
      { value: 3, labelMarathi: 'à¤–à¥‚à¤ª à¤²à¤µà¤•à¤° (à¤²à¤—à¥‡à¤š)' },
    ],
  },
  {
    id: 6,
    textMarathi: 'à¤®à¥à¤¸à¤³à¤§à¤¾à¤° à¤ªà¤¾à¤µà¤¸à¤¾à¤¨à¤‚à¤¤à¤° à¤ªà¤¾à¤£à¥€ à¤¸à¤¾à¤šà¥‚à¤¨ à¤°à¤¾à¤¹à¤¤à¥‡ à¤•à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤¹à¥‹, à¥¨-à¥© à¤¦à¤¿à¤µà¤¸ à¤°à¤¾à¤¹à¤¤à¥‡' },
      { value: 1, labelMarathi: 'à¤¥à¥‹à¤¡à¤¾ à¤µà¥‡à¤³ à¤°à¤¾à¤¹à¤¤à¥‡' },
      { value: 2, labelMarathi: 'à¤²à¤—à¥‡à¤š à¤¨à¤¿à¤˜à¥‚à¤¨ à¤œà¤¾à¤¤à¥‡' },
      { value: 3, labelMarathi: 'à¤…à¤œà¤¿à¤¬à¤¾à¤¤ à¤¸à¤¾à¤šà¤¤ à¤¨à¤¾à¤¹à¥€' },
    ],
  },
  {
    id: 7,
    textMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤–à¤¾à¤²à¥€ à¤•à¤¡à¤• à¤¥à¤° (à¤¹à¤¾à¤°à¥à¤¡à¤ªà¥…à¤¨) à¤†à¤¹à¥‡ à¤•à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤¹à¥‹' },
      { value: 1, labelMarathi: 'à¤¨à¤¾à¤¹à¥€' },
      { value: 2, labelMarathi: 'à¤–à¤¾à¤¤à¥à¤°à¥€ à¤¨à¤¾à¤¹à¥€' },
      { value: 3, labelMarathi: 'à¤ªà¤¾à¤Ÿà¤¾à¤šà¥à¤¯à¤¾ à¤–à¥‹à¤²à¥€à¤µà¤° à¤†à¤¹à¥‡' },
    ],
  },
  {
    id: 8,
    textMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤ªà¤¦à¤¾à¤°à¥à¤¥ (à¤•à¥à¤œà¤²à¥‡à¤²à¤¾ à¤ªà¤¾à¤²à¤¾à¤ªà¤¾à¤šà¥‹à¤³à¤¾) à¤•à¤¿à¤¤à¥€ à¤¦à¤¿à¤¸à¤¤à¥‹?',
    options: [
      { value: 0, labelMarathi: 'à¤–à¥‚à¤ª' },
      { value: 1, labelMarathi: 'à¤¥à¥‹à¤¡à¤¾' },
      { value: 2, labelMarathi: 'à¤…à¤¤à¥à¤¯à¤²à¥à¤ª' },
      { value: 3, labelMarathi: 'à¤®à¥à¤³à¥€à¤š à¤¨à¤¾à¤¹à¥€' },
    ],
  },
  {
    id: 9,
    textMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤—à¤¾à¤‚à¤¡à¥‚à¤³ à¤•à¤¿à¤‚à¤µà¤¾ à¤‡à¤¤à¤° à¤œà¥€à¤µ à¤¦à¤¿à¤¸à¤¤à¤¾à¤¤ à¤•à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤¹à¥‹, à¤­à¤°à¤ªà¥‚à¤°' },
      { value: 1, labelMarathi: 'à¤¥à¥‹à¤¡à¥‡ à¤¦à¤¿à¤¸à¤¤à¤¾à¤¤' },
      { value: 2, labelMarathi: 'à¤…à¤—à¤¦à¥€à¤š à¤•à¤®à¥€' },
      { value: 3, labelMarathi: 'à¤…à¤œà¤¿à¤¬à¤¾à¤¤ à¤¨à¤¾à¤¹à¥€' },
    ],
  },
  {
    id: 10,
    textMarathi: 'à¤®à¤¾à¤—à¥€à¤² à¤¹à¤‚à¤—à¤¾à¤®à¤¾à¤¤à¥€à¤² à¤ªà¥€à¤• à¤…à¤µà¤¶à¥‡à¤·à¤¾à¤‚à¤šà¥‡ à¤•à¤¾à¤¯ à¤•à¥‡à¤²à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤—à¤¾à¤¡à¤²à¥‡ / à¤†à¤šà¥à¤›à¤¾à¤¦à¤¨' },
      { value: 1, labelMarathi: 'à¤…à¤°à¥à¤§à¤µà¤Ÿ à¤—à¤¾à¤¡à¤²à¥‡' },
      { value: 2, labelMarathi: 'à¤ªà¥‚à¤°à¥à¤£ à¤•à¤¾à¤¢à¥‚à¤¨ à¤Ÿà¤¾à¤•à¤²à¥‡' },
      { value: 3, labelMarathi: 'à¤œà¤¾à¤³à¥‚à¤¨ à¤Ÿà¤¾à¤•à¤²à¥‡' },
    ],
  },
  {
    id: 11,
    textMarathi: 'à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤¶à¥‡à¤¤à¤¾à¤šà¤¾ à¤‰à¤¤à¤¾à¤° à¤•à¤¸à¤¾ à¤†à¤¹à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤¸à¤ªà¤¾à¤Ÿ' },
      { value: 1, labelMarathi: 'à¤¸à¥Œà¤®à¥à¤¯ à¤‰à¤¤à¤¾à¤°' },
      { value: 2, labelMarathi: 'à¤®à¤§à¥à¤¯à¤® à¤‰à¤¤à¤¾à¤°' },
      { value: 3, labelMarathi: 'à¤¤à¥€à¤µà¥à¤° à¤‰à¤¤à¤¾à¤°' },
    ],
  },
  {
    id: 12,
    textMarathi: 'à¤¶à¥‡à¤¤à¤¾à¤œà¤µà¤³ à¤ªà¤¾à¤£à¥à¤¯à¤¾à¤šà¤¾ à¤¸à¥à¤°à¥‹à¤¤ à¤•à¥‹à¤£à¤¤à¤¾ à¤†à¤¹à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤¨à¤¦à¥€ / à¤•à¤¾à¤²à¤µà¤¾' },
      { value: 1, labelMarathi: 'à¤¤à¤²à¤¾à¤µ / à¤¬à¤‚à¤§à¤¾à¤°à¤¾' },
      { value: 2, labelMarathi: 'à¤µà¤¿à¤¹à¥€à¤° / à¤¬à¥‹à¤…à¤°' },
      { value: 3, labelMarathi: 'à¤•à¤¾à¤¹à¥€à¤¹à¥€ à¤¨à¤¾à¤¹à¥€ (à¤ªà¤¾à¤µà¤¸à¤¾à¤µà¤° à¤…à¤µà¤²à¤‚à¤¬à¥‚à¤¨)' },
    ],
  },
  {
    id: 13,
    textMarathi: 'à¤®à¤¾à¤—à¥€à¤² à¤¹à¤‚à¤—à¤¾à¤®à¥€ à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨ à¤•à¤¸à¥‡ à¤¹à¥‹à¤¤à¥‡?',
    options: [
      { value: 0, labelMarathi: 'à¤šà¤¾à¤‚à¤—à¤²à¥‡ (à¤œà¤¾à¤¸à¥à¤¤)' },
      { value: 1, labelMarathi: 'à¤®à¤§à¥à¤¯à¤®' },
      { value: 2, labelMarathi: 'à¤•à¤®à¥€' },
      { value: 3, labelMarathi: 'à¤–à¥‚à¤ª à¤•à¤®à¥€' },
    ],
  },
  {
    id: 14,
    textMarathi: 'à¤®à¤¾à¤—à¥€à¤² à¤µà¥‡à¤³à¥€ à¤–à¤¤à¤¾à¤²à¤¾ à¤ªà¤¿à¤•à¤¾à¤¨à¥‡ à¤•à¤¸à¤¾ à¤ªà¥à¤°à¤¤à¤¿à¤¸à¤¾à¤¦ à¤¦à¤¿à¤²à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤‰à¤¤à¥à¤¤à¤®' },
      { value: 1, labelMarathi: 'à¤¸à¤°à¤¾à¤¸à¤°à¥€' },
      { value: 2, labelMarathi: 'à¤–à¤°à¤¾à¤¬' },
      { value: 3, labelMarathi: 'à¤–à¤¤ à¤¦à¤¿à¤²à¥‡ à¤¨à¤µà¥à¤¹à¤¤à¥‡' },
    ],
  },
  {
    id: 15,
    textMarathi: 'à¤œà¤®à¤¿à¤¨à¥€à¤¤à¥‚à¤¨ à¤•à¤¾à¤¹à¥€ à¤µà¤¿à¤¶à¥‡à¤· à¤µà¤¾à¤¸ à¤¯à¥‡à¤¤à¥‹ à¤•à¤¾?',
    options: [
      { value: 0, labelMarathi: 'à¤†à¤‚à¤¬à¤Ÿ à¤µà¤¾à¤¸' },
      { value: 1, labelMarathi: 'à¤•à¥‹à¤£à¤¤à¤¾à¤¹à¥€ à¤µà¤¾à¤¸ à¤¨à¤¾à¤¹à¥€' },
      { value: 2, labelMarathi: 'à¤¸à¤¾à¤§à¤¾ à¤®à¤¾à¤¤à¥€à¤šà¤¾ à¤µà¤¾à¤¸' },
      { value: 3, labelMarathi: 'à¤•à¥à¤·à¤¾à¤°à¤¯à¥à¤•à¥à¤¤ / à¤ªà¤¾à¤‚à¤¢à¤°à¤Ÿ à¤¡à¤¾à¤—' },
    ],
  },
];

// â”€â”€ Scoring Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ScoreBoard {
  blackCotton: number;
  redLaterite: number;
  sandy: number;
  alluvial: number;
}

function scoreAnswer(questionId: number, answerIndex: number, board: ScoreBoard): void {
  const scores = simplifiedScore(questionId, answerIndex);
  board.blackCotton += scores.blackCotton ?? 0;
  board.redLaterite += scores.redLaterite ?? 0;
  board.sandy += scores.sandy ?? 0;
  board.alluvial += scores.alluvial ?? 0;
}

function simplifiedScore(q: number, a: number): Partial<ScoreBoard> {
  // Pre-defined reference table
  const table: Record<number, Record<number, Partial<ScoreBoard>>> = {
    1: { 0: { blackCotton: 3, alluvial: 1 }, 1: { redLaterite: 3 }, 2: { sandy: 2, alluvial: 1 }, 3: { alluvial: 3 } },
    2: { 0: { blackCotton: 2, alluvial: 2 }, 1: { sandy: 3, alluvial: 1 }, 2: { redLaterite: 2, sandy: 1 }, 3: { blackCotton: 3 } },
    3: { 0: { blackCotton: 3, alluvial: 1 }, 1: { sandy: 2, redLaterite: 2 }, 2: { redLaterite: 3 }, 3: { sandy: 3 } },
    4: { 0: { blackCotton: 3 }, 1: { redLaterite: 2, alluvial: 2 }, 2: { sandy: 2 }, 3: { blackCotton: 1 } },
    5: { 0: { blackCotton: 3, alluvial: 1 }, 1: { alluvial: 3 }, 2: { redLaterite: 2, sandy: 1 }, 3: { sandy: 3 } },
    6: { 0: { blackCotton: 3 }, 1: { alluvial: 2 }, 2: { redLaterite: 1, sandy: 1 }, 3: { sandy: 3 } },
    7: { 0: { blackCotton: 2 }, 1: { alluvial: 2, redLaterite: 1 }, 2: {}, 3: { blackCotton: 1 } },
    8: { 0: { alluvial: 3 }, 1: { alluvial: 2, redLaterite: 1 }, 2: { sandy: 2, redLaterite: 1 }, 3: { sandy: 3 } },
    9: { 0: { alluvial: 3 }, 1: { alluvial: 2, redLaterite: 1 }, 2: { sandy: 1 }, 3: { sandy: 3 } },
    10:{ 0: { alluvial: 3 }, 1: { alluvial: 2 }, 2: { sandy: 2 }, 3: { blackCotton: 1, sandy: 2 } },
    11:{ 0: { blackCotton: 2, alluvial: 2 }, 1: { alluvial: 2 }, 2: { redLaterite: 2 }, 3: { sandy: 3 } },
    12:{ 0: { blackCotton: 1, alluvial: 3 }, 1: { alluvial: 2 }, 2: { sandy: 2, redLaterite: 1 }, 3: { blackCotton: 1 } },
    13:{ 0: { alluvial: 3 }, 1: { redLaterite: 2, sandy: 1 }, 2: { blackCotton: 2 }, 3: { blackCotton: 3 } },
    14:{ 0: { alluvial: 3 }, 1: { redLaterite: 2 }, 2: { blackCotton: 2, sandy: 1 }, 3: {} },
    15:{ 0: { redLaterite: 2, alluvial: 1 }, 1: { alluvial: 2 }, 2: { alluvial: 2 }, 3: { blackCotton: 2 } },
  };
  return table[q]?.[a] ?? {};
}

function determineSoilType(board: ScoreBoard): SoilType {
  const max = Math.max(board.blackCotton, board.redLaterite, board.sandy, board.alluvial);
  if (board.blackCotton === max) return 'black_cotton';
  if (board.redLaterite === max) return 'red_laterite';
  if (board.sandy === max) return 'sandy';
  return 'alluvial';
}

function estimatePh(board: ScoreBoard, _answers: number[]): number {
  // Simplified model: based on soil type and colour/ texture answers
  if (board.redLaterite > board.alluvial) return 6.5;
  if (board.blackCotton > board.alluvial) return 8.0;
  if (board.sandy > board.alluvial) return 7.0;
  return 7.2;
}

function estimateNitrogen(_board: ScoreBoard, answers: number[]): 'low' | 'medium' | 'high' {
  const organicScore = answers[7] + answers[8] + answers[9]; // lower index = more organic
  if (organicScore <= 2) return 'high';
  if (organicScore <= 4) return 'medium';
  return 'low';
}

function estimateWaterRetention(board: ScoreBoard, _answers: number[]): 'low' | 'medium' | 'high' {
  if (board.sandy >= board.blackCotton && board.sandy >= board.alluvial) return 'low';
  if (board.blackCotton > board.alluvial) return 'high';
  return 'medium';
}

function generateRecommendations(soilType: SoilType, nitrogenLevel: string, waterRetention: string): string[] {
  const recs: string[] = [];
  if (nitrogenLevel === 'low') recs.push('à¤¨à¤¤à¥à¤°à¤¾à¤šà¥€ à¤•à¤®à¤¤à¤°à¤¤à¤¾ à¤­à¤°à¥‚à¤¨ à¤•à¤¾à¤¢à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¯à¥à¤°à¤¿à¤¯à¤¾à¤šà¥‡ à¤µà¤¿à¤­à¤¾à¤œà¤¿à¤¤ à¤¡à¥‹à¤¸ à¤¦à¥à¤¯à¤¾.');
  if (waterRetention === 'low') recs.push('à¤“à¤²à¤¾à¤µà¤¾ à¤Ÿà¤¿à¤•à¤µà¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤†à¤šà¥à¤›à¤¾à¤¦à¤¨ (à¤®à¤²à¥à¤šà¤¿à¤‚à¤—) à¤•à¤°à¤¾.');
  if (soilType === 'black_cotton') recs.push('à¤•à¤¾à¤³à¥à¤¯à¤¾ à¤•à¤ªà¤¾à¤¶à¥€à¤šà¥à¤¯à¤¾ à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤ªà¥‹à¤Ÿà¥…à¤¶à¤šà¥‡ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤•à¤®à¥€ à¤•à¤°à¤¾.');
  if (soilType === 'red_laterite') recs.push('à¤²à¤¾à¤² à¤œà¤®à¤¿à¤¨à¥€à¤¤ à¤à¤¿à¤‚à¤• à¤µà¤¾à¤ªà¤°à¤¾.');
  return recs;
}

function computeFertilizerDosage(soilType: SoilType, nitrogenLevel: string) {
  let urea = 130, dap = 52, mop = 40;
  if (nitrogenLevel === 'high') urea = 100;
  if (nitrogenLevel === 'low') urea = 160;
  if (soilType === 'black_cotton') mop *= 0.8;
  if (soilType === 'red_laterite') mop = 50;
  return {
    ureaKgPerAcre: urea,
    dapKgPerAcre: dap,
    mopKgPerAcre: mop,
    extraInfoMarathi: 'à¤¹à¥€ à¤¶à¤¿à¤«à¤¾à¤°à¤¸ à¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤†à¤¹à¥‡. à¤®à¤¾à¤¤à¥€ à¤ªà¤°à¥€à¤•à¥à¤·à¤£ à¤…à¤¹à¤µà¤¾à¤²à¤¾à¤¨à¥à¤¸à¤¾à¤° à¤¬à¤¦à¤² à¤•à¤°à¤¾.',
  };
}

/**
 * Analyze the digital soil card based on 15 answers (indexes 0â€“3).
 */
export function analyzeSoilCard(answers: number[]): SoilCardResult {
  const board: ScoreBoard = { blackCotton: 0, redLaterite: 0, sandy: 0, alluvial: 0 };
  answers.forEach((ans, idx) => {
    scoreAnswer(idx + 1, ans, board);
  });
  const soilType = determineSoilType(board);
  const phEstimate = estimatePh(board, answers);
  const nitrogenLevel = estimateNitrogen(board, answers);
  const waterRetention = estimateWaterRetention(board, answers);
  const recommendations = generateRecommendations(soilType, nitrogenLevel, waterRetention);
  const fertilizerDosage = computeFertilizerDosage(soilType, nitrogenLevel);

  return { soilType, phEstimate, nitrogenLevel, waterRetention, recommendations, fertilizerDosage };
}
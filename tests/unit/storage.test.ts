import { describe, it, expect, beforeEach } from 'vitest';
import {
  getHistory,
  getHistoryItemById,
  saveAnalysisToHistory,
  deleteHistoryItem,
  clearAllHistory,
  getUserProfile,
  saveUserProfile,
} from '@/lib/storage';
import { AnalysisResult } from '@/lib/schemas/analyze';

const sampleResult: AnalysisResult = {
  clauses: [
    {
      id: 'c1',
      title: 'Security Deposit',
      category: 'Financial',
      quote: 'Tenant shall pay Rs 50,000 security deposit.',
      quoteVerified: true,
      explanation: 'Deposit is 50,000.',
      riskLevel: 'medium',
      riskReason: 'Notice period condition attached.',
      questionToAsk: 'When is it returned?',
    },
    {
      id: 'c2',
      title: 'Lock-in Period',
      category: 'Term',
      quote: 'Lock-in period is 6 months.',
      quoteVerified: true,
      explanation: 'Cannot vacate within 6 months.',
      riskLevel: 'high',
      riskReason: 'Forfeits deposit if left early.',
      questionToAsk: 'Can lock-in be waived on job transfer?',
    },
  ],
  keyFacts: {
    obligations: [{ party: 'Tenant', obligation: 'Pay rent' }],
    amounts: [{ label: 'Deposit', amount: 'Rs 50,000' }],
    dates: [{ label: 'Term', date: '11 months' }],
  },
  missingProtections: [
    {
      name: 'Grace Period',
      whyItMatters: 'Late fees apply immediately.',
      suggestedQuestion: 'Can we add 5 days grace period?',
    },
  ],
  lawyerQuestions: ['Ask about deposit return timelines.'],
  riskSummary: {
    high: 1,
    medium: 1,
    low: 0,
    info: 0,
    total: 2,
  },
  docType: 'rental',
  language: 'en',
};

describe('Storage & History Management', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    // @ts-expect-error Mock localStorage
    global.localStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };
  });

  it('saves analysis to history and computes risk summary counts', () => {
    const saved = saveAnalysisToHistory({
      result: sampleResult,
      documentType: 'rental',
      language: 'en',
    });

    expect(saved).toBeDefined();
    expect(saved?.riskSummary.high).toBe(1);
    expect(saved?.riskSummary.medium).toBe(1);
    expect(saved?.riskSummary.low).toBe(0);

    const history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0]?.title).toBe('Security Deposit');
  });

  it('caps history at 20 items (FIFO)', () => {
    const baseClause = sampleResult.clauses[0]!;
    for (let i = 0; i < 25; i++) {
      saveAnalysisToHistory({
        result: {
          ...sampleResult,
          clauses: [{ ...baseClause, id: `c_${i}`, title: `Clause ${i}` }],
        },
        documentType: 'rental',
        language: 'en',
      });
    }

    const history = getHistory();
    expect(history.length).toBe(20);
    // Most recent is at top
    expect(history[0]?.title).toBe('Clause 24');
  });

  it('deletes an item by id', () => {
    const item = saveAnalysisToHistory({
      result: sampleResult,
      documentType: 'rental',
      language: 'en',
    });

    expect(getHistory().length).toBe(1);
    deleteHistoryItem(item!.id);
    expect(getHistory().length).toBe(0);
  });

  it('clears all history items', () => {
    saveAnalysisToHistory({
      result: sampleResult,
      documentType: 'rental',
      language: 'en',
    });
    expect(getHistory().length).toBe(1);
    clearAllHistory();
    expect(getHistory().length).toBe(0);
  });

  it('saves and retrieves user profile', () => {
    const defaultProfile = getUserProfile();
    expect(defaultProfile.name).toBe('Legal Lens User');

    saveUserProfile({
      name: 'Priya Sharma',
      role: 'Tenant',
      jurisdiction: 'Maharashtra, India',
      notes: 'Renting apartment in Pune',
    });

    const updated = getUserProfile();
    expect(updated.name).toBe('Priya Sharma');
    expect(updated.jurisdiction).toBe('Maharashtra, India');
  });

  it('gets history item by id', () => {
    const item = saveAnalysisToHistory({
      result: sampleResult,
      documentType: 'rental',
      language: 'en',
    });
    const found = getHistoryItemById(item!.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(item?.id);

    expect(getHistoryItemById('non-existent')).toBeNull();
  });

  it('handles invalid JSON or corrupt storage gracefully', () => {
    mockStore['legal_lens_history'] = 'invalid-json';
    mockStore['legal_lens_profile'] = 'invalid-json';

    expect(getHistory()).toEqual([]);
    expect(getUserProfile().name).toBe('Legal Lens User');
  });
});

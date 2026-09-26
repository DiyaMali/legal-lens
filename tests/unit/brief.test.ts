/**
 * Unit tests for brief.ts (lawyer-prep brief builder)
 */

import { describe, it, expect } from 'vitest';
import { buildBrief, briefToMarkdown } from '@/lib/brief';
import { AnalysisResult } from '@/lib/schemas/analyze';

const MOCK_RESULT: AnalysisResult = {
  docType: 'rental',
  language: 'en',
  clauses: [
    {
      id: 'c1',
      title: 'Security deposit forfeiture',
      category: 'payment',
      quote: 'If the Tenant vacates before the lock-in period, the security deposit shall be forfeited.',
      quoteVerified: true,
      explanation: 'You lose your full deposit if you leave early.',
      riskLevel: 'high',
      riskReason: 'Full deposit forfeiture is severe and one-sided.',
      questionToAsk: 'Can the forfeiture be partial rather than full?',
    },
    {
      id: 'c2',
      title: 'Late payment fee',
      category: 'payment',
      quote: 'A late payment fee of Rs. 500 per day shall be charged.',
      quoteVerified: true,
      explanation: 'Daily penalty for late rent.',
      riskLevel: 'medium',
      riskReason: 'Compound daily fees can add up quickly.',
      questionToAsk: 'Is there a grace period before fees start?',
    },
  ],
  keyFacts: {
    obligations: [{ party: 'Tenant', obligation: 'Pay Rs. 25,000 by the 5th of each month' }],
    amounts: [{ label: 'Monthly rent', amount: 'Rs. 25,000' }],
    dates: [{ label: 'Commencement', date: '1st February 2024' }],
  },
  missingProtections: [
    {
      name: 'Registration and stamp duty',
      whyItMatters: 'Unregistered agreements may not be admissible as evidence.',
      suggestedQuestion: 'Will this agreement be registered?',
    },
  ],
  lawyerQuestions: ['Can the lock-in clause be waived in exceptional circumstances?'],
  riskSummary: { high: 1, medium: 1, low: 0, info: 0, total: 2 },
};

describe('buildBrief', () => {
  it('returns a brief with correct title', () => {
    const brief = buildBrief(MOCK_RESULT);
    expect(brief.title).toContain('Rental');
  });

  it('includes all expected sections', () => {
    const brief = buildBrief(MOCK_RESULT);
    const sectionTitles = brief.sections.map((s) => s.title);
    expect(sectionTitles).toContain('Document Overview');
    expect(sectionTitles).toContain('Key Facts');
    expect(sectionTitles).toContain('Top Risks to Discuss');
    expect(sectionTitles).toContain('Missing Protections');
    expect(sectionTitles).toContain('Questions to Ask Your Lawyer');
  });

  it('includes the disclaimer', () => {
    const brief = buildBrief(MOCK_RESULT);
    expect(brief.disclaimer).toContain('not legal advice');
  });

  it('includes high-risk clause in top risks', () => {
    const brief = buildBrief(MOCK_RESULT);
    const risksSection = brief.sections.find((s) => s.title === 'Top Risks to Discuss');
    expect(risksSection?.content).toContain('Security deposit forfeiture');
  });

  it('includes missing protection', () => {
    const brief = buildBrief(MOCK_RESULT);
    const missingSection = brief.sections.find((s) => s.title === 'Missing Protections');
    expect(missingSection?.content).toContain('Registration and stamp duty');
  });

  it('includes key amounts', () => {
    const brief = buildBrief(MOCK_RESULT);
    const factsSection = brief.sections.find((s) => s.title === 'Key Facts');
    expect(factsSection?.content).toContain('Rs. 25,000');
  });
});

describe('briefToMarkdown', () => {
  it('produces valid markdown with h1 title', () => {
    const brief = buildBrief(MOCK_RESULT);
    const md = briefToMarkdown(brief);
    expect(md).toContain('# Lawyer-Prep Brief');
  });

  it('includes all sections as h2 headings', () => {
    const brief = buildBrief(MOCK_RESULT);
    const md = briefToMarkdown(brief);
    expect(md).toContain('## Document Overview');
    expect(md).toContain('## Key Facts');
  });

  it('includes the disclaimer', () => {
    const brief = buildBrief(MOCK_RESULT);
    const md = briefToMarkdown(brief);
    expect(md).toContain('## Disclaimer');
    expect(md).toContain('not legal advice');
  });
});

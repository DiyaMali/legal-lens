/**
 * Unit tests for Zod schemas (src/lib/schemas/)
 */

import { describe, it, expect } from 'vitest';
import {
  AnalyzeRequestSchema,
  ClauseSchema,
  AskRequestSchema,
  CompareRequestSchema,
  ExtractResponseSchema,
} from '@/lib/schemas';

describe('AnalyzeRequestSchema', () => {
  it('accepts valid input', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'This is a valid legal document with sufficient length.',
      docType: 'rental',
      language: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty text', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: '',
      docType: 'rental',
      language: 'en',
    });
    expect(result.success).toBe(false);
  });

  it('rejects text over 80,000 characters', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'a'.repeat(80_001),
      docType: 'rental',
      language: 'en',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid docType', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'valid document text',
      docType: 'mortgage', // not in the enum
      language: 'en',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid language', () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: 'valid document text',
      docType: 'rental',
      language: 'fr', // not supported
    });
    expect(result.success).toBe(false);
  });
});

describe('ClauseSchema', () => {
  const validClause = {
    id: 'c1',
    title: 'Security deposit',
    category: 'payment',
    quote: 'The deposit shall be returned within 30 days.',
    quoteVerified: true,
    explanation: 'Your deposit comes back in 30 days.',
    riskLevel: 'low',
    riskReason: 'Standard term.',
    questionToAsk: 'Are there any deduction criteria?',
  };

  it('accepts a valid clause', () => {
    expect(ClauseSchema.safeParse(validClause).success).toBe(true);
  });

  it('rejects invalid riskLevel', () => {
    const result = ClauseSchema.safeParse({ ...validClause, riskLevel: 'critical' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { quote: _q, ...withoutQuote } = validClause;
    expect(ClauseSchema.safeParse(withoutQuote).success).toBe(false);
  });
});

describe('AskRequestSchema', () => {
  it('accepts valid input', () => {
    const result = AskRequestSchema.safeParse({
      text: 'Document text here',
      question: 'What is the notice period?',
      language: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional history', () => {
    const result = AskRequestSchema.safeParse({
      text: 'Document text here',
      question: 'What is the notice period?',
      language: 'hi',
      history: [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects question over 1000 characters', () => {
    const result = AskRequestSchema.safeParse({
      text: 'Document text',
      question: 'q'.repeat(1001),
      language: 'en',
    });
    expect(result.success).toBe(false);
  });
});

describe('CompareRequestSchema', () => {
  it('accepts two valid documents', () => {
    const result = CompareRequestSchema.safeParse({
      textA: 'Document A text',
      textB: 'Document B text',
      docType: 'employment',
      language: 'mr',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty textB', () => {
    const result = CompareRequestSchema.safeParse({
      textA: 'Document A text',
      textB: '',
      docType: 'loan',
      language: 'en',
    });
    expect(result.success).toBe(false);
  });
});

describe('ExtractResponseSchema', () => {
  it('validates correct extract response', () => {
    const valid = {
      text: 'Extracted sample text',
      charCount: 21,
      pageCount: 1,
    };
    expect(ExtractResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty text or negative count', () => {
    expect(ExtractResponseSchema.safeParse({ text: '', charCount: 0 }).success).toBe(false);
    expect(ExtractResponseSchema.safeParse({ text: 'abc', charCount: -1 }).success).toBe(false);
  });
});


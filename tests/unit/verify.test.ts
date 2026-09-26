/**
 * Unit tests for quote verification (src/lib/ai/verify.ts)
 *
 * These tests run entirely without AI — verifyQuote() is a pure function.
 */

import { describe, it, expect } from 'vitest';
import { verifyQuote, verifyQuotes, normalizeForVerification } from '@/lib/ai/verify';

const SAMPLE_DOCUMENT = `
This Rental Agreement is entered into on 1st January 2024.
The monthly rent shall be Rs. 25,000 payable on or before the 5th day.
A late payment fee of Rs. 500 per day shall be charged.
The security deposit shall be refunded within 30 days of vacating.
`;

describe('normalizeForVerification', () => {
  it('trims whitespace', () => {
    expect(normalizeForVerification('  hello  ')).toBe('hello');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeForVerification('hello   world')).toBe('hello world');
  });

  it('collapses newlines', () => {
    expect(normalizeForVerification('hello\nworld')).toBe('hello world');
  });

  it('lowercases text', () => {
    expect(normalizeForVerification('Hello World')).toBe('hello world');
  });

  it('normalizes curly quotes to straight', () => {
    expect(normalizeForVerification('\u2018hello\u2019')).toBe("'hello'");
    expect(normalizeForVerification('\u201Chello\u201D')).toBe('"hello"');
  });

  it('normalizes em dash to hyphen', () => {
    expect(normalizeForVerification('a\u2014b')).toBe('a-b');
  });
});

describe('verifyQuote', () => {
  it('returns true for exact quote from document', () => {
    const quote = 'The monthly rent shall be Rs. 25,000 payable on or before the 5th day.';
    expect(verifyQuote(SAMPLE_DOCUMENT, quote)).toBe(true);
  });

  it('returns true for quote with minor whitespace differences', () => {
    // Multiple spaces normalized
    const quote = 'The monthly rent  shall be Rs. 25,000 payable on or before the 5th day.';
    expect(verifyQuote(SAMPLE_DOCUMENT, quote)).toBe(true);
  });

  it('returns false for invented content', () => {
    const quote = 'The tenant must pay Rs. 50,000 per month for electricity.';
    expect(verifyQuote(SAMPLE_DOCUMENT, quote)).toBe(false);
  });

  it('returns false for empty quote', () => {
    expect(verifyQuote(SAMPLE_DOCUMENT, '')).toBe(false);
  });

  it('returns false for empty document', () => {
    expect(verifyQuote('', 'some quote here that is longer than ten characters')).toBe(false);
  });

  it('returns false for quotes shorter than 10 characters', () => {
    expect(verifyQuote(SAMPLE_DOCUMENT, 'Rs. 25')).toBe(false);
  });

  it('is case-insensitive', () => {
    const quote = 'THE MONTHLY RENT SHALL BE RS. 25,000 PAYABLE ON OR BEFORE THE 5TH DAY.';
    expect(verifyQuote(SAMPLE_DOCUMENT, quote)).toBe(true);
  });

  it('handles null-like empty inputs', () => {
    expect(verifyQuote('', '')).toBe(false);
  });
});

describe('verifyQuotes (batch)', () => {
  it('verifies multiple quotes in one pass', () => {
    const quotes = [
      'The monthly rent shall be Rs. 25,000 payable on or before the 5th day.',
      'This is completely invented text that does not exist in the document at all.',
      'The security deposit shall be refunded within 30 days of vacating.',
    ];
    const results = verifyQuotes(SAMPLE_DOCUMENT, quotes);
    expect(results).toHaveLength(3);
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(false);
    expect(results[2]).toBe(true);
  });

  it('returns all false for empty document', () => {
    const results = verifyQuotes('', ['quote one that is very long enough', 'another very long quote here']);
    expect(results.every((r) => r === false)).toBe(true);
  });
});

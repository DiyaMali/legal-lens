/**
 * Unit tests for computeRiskSummary (src/lib/ai/analyze.ts)
 * This is the deterministic risk scoring function — no AI involved.
 */

import { describe, it, expect } from 'vitest';
import { computeRiskSummary } from '@/lib/ai/analyze';

describe('computeRiskSummary', () => {
  it('returns all zeros for empty input', () => {
    const summary = computeRiskSummary([]);
    expect(summary).toEqual({ high: 0, medium: 0, low: 0, info: 0, total: 0 });
  });

  it('correctly counts risk levels', () => {
    const summary = computeRiskSummary(['high', 'high', 'medium', 'low', 'info', 'low']);
    expect(summary.high).toBe(2);
    expect(summary.medium).toBe(1);
    expect(summary.low).toBe(2);
    expect(summary.info).toBe(1);
    expect(summary.total).toBe(6);
  });

  it('total equals number of input levels', () => {
    const levels = ['high', 'medium', 'low', 'info', 'high'] as const;
    const summary = computeRiskSummary([...levels]);
    expect(summary.total).toBe(levels.length);
  });

  it('handles all same risk level', () => {
    const summary = computeRiskSummary(['high', 'high', 'high']);
    expect(summary.high).toBe(3);
    expect(summary.medium).toBe(0);
    expect(summary.low).toBe(0);
    expect(summary.info).toBe(0);
    expect(summary.total).toBe(3);
  });
});

/**
 * Unit tests for cache.ts (LRU cache and request deduplication)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  makeCacheKey,
  getCached,
  setCached,
  clearCache,
  getCacheSize,
  deduplicateRequest,
} from '@/lib/cache';

describe('makeCacheKey', () => {
  it('returns a 64-character hex string (SHA-256)', () => {
    const key = makeCacheKey('text', 'rental', 'en', 'v1');
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns the same key for the same inputs', () => {
    const a = makeCacheKey('text', 'rental', 'en', 'v1');
    const b = makeCacheKey('text', 'rental', 'en', 'v1');
    expect(a).toBe(b);
  });

  it('returns different keys for different inputs', () => {
    const a = makeCacheKey('text', 'rental', 'en', 'v1');
    const b = makeCacheKey('text', 'employment', 'en', 'v1');
    expect(a).not.toBe(b);
  });

  it('returns different keys when prompt version changes', () => {
    const a = makeCacheKey('text', 'rental', 'en', 'v1');
    const b = makeCacheKey('text', 'rental', 'en', 'v2');
    expect(a).not.toBe(b);
  });
});

describe('cache get/set/clear', () => {
  beforeEach(() => {
    clearCache();
  });

  it('returns undefined for a missing key', () => {
    expect(getCached('nonexistent')).toBeUndefined();
  });

  it('stores and retrieves a value', () => {
    const key = makeCacheKey('doc', 'rental', 'en', 'v1');
    const value = { clauses: [], riskSummary: { high: 0, medium: 0, low: 0, info: 0, total: 0 } };
    setCached(key, value);
    expect(getCached(key)).toEqual(value);
  });

  it('clears all entries', () => {
    const key = makeCacheKey('doc', 'rental', 'en', 'v1');
    setCached(key, { data: 'test' });
    clearCache();
    expect(getCached(key)).toBeUndefined();
    expect(getCacheSize()).toBe(0);
  });

  it('correctly reports cache size', () => {
    expect(getCacheSize()).toBe(0);
    setCached('key1', { data: 1 });
    setCached('key2', { data: 2 });
    expect(getCacheSize()).toBe(2);
  });
});

describe('deduplicateRequest', () => {
  beforeEach(() => {
    clearCache();
  });

  it('coalesces multiple concurrent calls into a single execution', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 20));
      return { result: 'ok' };
    };

    const [res1, res2, res3] = await Promise.all([
      deduplicateRequest('dup-key', fetcher),
      deduplicateRequest('dup-key', fetcher),
      deduplicateRequest('dup-key', fetcher),
    ]);

    expect(res1).toEqual({ result: 'ok' });
    expect(res2).toEqual({ result: 'ok' });
    expect(res3).toEqual({ result: 'ok' });
    expect(callCount).toBe(1);
  });

  it('allows subsequent calls after initial promise resolves', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { count: callCount };
    };

    const first = await deduplicateRequest('sub-key', fetcher);
    const second = await deduplicateRequest('sub-key', fetcher);

    expect(first).toEqual({ count: 1 });
    expect(second).toEqual({ count: 2 });
    expect(callCount).toBe(2);
  });
});

/**
 * Unit tests for cache.ts (LRU cache)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { makeCacheKey, getCached, setCached, clearCache, getCacheSize } from '@/lib/cache';

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

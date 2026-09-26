/**
 * Unit tests for rate-limit.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit, clearRateLimits, getRequestCount } from '@/lib/rate-limit';

const TEST_IP = '192.168.1.100';
const MAX_REQUESTS = 5;
const WINDOW_MS = 60_000;

describe('checkRateLimit', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('allows the first request', () => {
    const result = checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    expect(result.allowed).toBe(true);
  });

  it('allows requests up to the limit', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      const result = checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the request after the limit is reached', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    }
    const result = checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('provides retryAfterMs when rate limited', () => {
    for (let i = 0; i <= MAX_REQUESTS; i++) {
      checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    }
    const result = checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    expect(result.retryAfterMs).toBeDefined();
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(WINDOW_MS);
  });

  it('tracks different IPs independently', () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip1, MAX_REQUESTS, WINDOW_MS);
    }

    // ip1 is limited, ip2 is not
    expect(checkRateLimit(ip1, MAX_REQUESTS, WINDOW_MS).allowed).toBe(false);
    expect(checkRateLimit(ip2, MAX_REQUESTS, WINDOW_MS).allowed).toBe(true);
  });
});

describe('resetRateLimit', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('resets a specific IP', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    }
    expect(checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS).allowed).toBe(false);

    resetRateLimit(TEST_IP);
    expect(checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS).allowed).toBe(true);
  });
});

describe('getRequestCount', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('returns 0 for a fresh IP', () => {
    expect(getRequestCount(TEST_IP, WINDOW_MS)).toBe(0);
  });

  it('counts requests correctly', () => {
    checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    checkRateLimit(TEST_IP, MAX_REQUESTS, WINDOW_MS);
    expect(getRequestCount(TEST_IP, WINDOW_MS)).toBe(2);
  });
});

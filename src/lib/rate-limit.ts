/**
 * In-memory sliding-window rate limiter for AI API routes.
 *
 * WHY: Prevents a single IP from hammering the Gemini API and incurring cost.
 * This is an in-memory implementation — it is best-effort on serverless because
 * each function instance has its own memory. A Redis/Upstash store would provide
 * accurate cross-instance rate limiting in production (noted in README).
 *
 * Algorithm: Sliding window — stores timestamps of recent requests per IP,
 * removes expired ones, and rejects if count exceeds the limit.
 */

import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/config';

/** Map of IP → sorted list of request timestamps (ms) */
const requestLog = new Map<string, number[]>();

/**
 * Check whether the given IP is within the rate limit.
 *
 * @returns `{ allowed: true }` if the request can proceed,
 *          `{ allowed: false, retryAfterMs: number }` if rate limited.
 */
export function checkRateLimit(
  ip: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get and prune timestamps outside the current window
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    // Time until the oldest request falls out of the window
    const oldest = timestamps[0];
    const retryAfterMs = oldest !== undefined ? oldest + windowMs - now : windowMs;
    return { allowed: false, retryAfterMs };
  }

  // Record this request
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return { allowed: true };
}

/**
 * Reset the rate limit state for a given IP (useful in tests).
 */
export function resetRateLimit(ip: string): void {
  requestLog.delete(ip);
}

/**
 * Clear all rate limit state (useful in tests).
 */
export function clearRateLimits(): void {
  requestLog.clear();
}

/**
 * Returns the number of requests recorded for an IP in the current window.
 * Useful for tests and diagnostics.
 */
export function getRequestCount(ip: string, windowMs = RATE_LIMIT_WINDOW_MS): number {
  const now = Date.now();
  const windowStart = now - windowMs;
  return (requestLog.get(ip) ?? []).filter((t) => t > windowStart).length;
}

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
 *
 * Memory optimization: Automatically sweeps expired IP entries when map size
 * exceeds 1,000 keys to guarantee bounded memory consumption.
 */

import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/config';

/** Maximum number of tracked IP keys before running an automatic memory sweep */
const MAX_TRACKED_IPS = 1_000;

/** Map of IP → sorted list of request timestamps (ms) */
const requestLog = new Map<string, number[]>();

/**
 * Remove stale IP entries whose timestamps are entirely outside the active window.
 */
function sweepStaleEntries(now: number, windowMs: number): void {
  const windowStart = now - windowMs;
  for (const [ip, timestamps] of requestLog.entries()) {
    const valid = timestamps.filter((t) => t > windowStart);
    if (valid.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, valid);
    }
  }
}

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

  // Memory guard: perform sweep when tracking exceeds threshold
  if (requestLog.size > MAX_TRACKED_IPS) {
    sweepStaleEntries(now, windowMs);
  }

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
 * Get the number of requests in the current window for an IP (useful in tests).
 */
export function getRequestCount(ip: string, windowMs = RATE_LIMIT_WINDOW_MS): number {
  const windowStart = Date.now() - windowMs;
  return (requestLog.get(ip) ?? []).filter((t) => t > windowStart).length;
}


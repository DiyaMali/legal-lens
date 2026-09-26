/**
 * In-memory LRU cache and request coalescing for AI analysis results.
 *
 * WHY: Identical requests (same document text + docType + language + prompt version)
 * should not repeat expensive Gemini API calls. The cache key is a SHA-256 hash,
 * so documents are never stored as plaintext.
 *
 * In-flight request deduplication prevents thundering herd / dogpiling when multiple
 * clients request analysis of the same document simultaneously.
 */

import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
import { CACHE_MAX_SIZE, CACHE_TTL_MS } from '@/lib/config';

/** Cache stores serialisable JSON objects by SHA-256 key */
type CacheValue = Record<string, unknown>;

/** Singleton analysis result cache */
let _analyzeCache: LRUCache<string, CacheValue> | null = null;

function getAnalyzeCache(): LRUCache<string, CacheValue> {
  if (!_analyzeCache) {
    _analyzeCache = new LRUCache<string, CacheValue>({
      max: CACHE_MAX_SIZE,
      ttl: CACHE_TTL_MS,
    });
  }
  return _analyzeCache;
}

/** Map of in-flight promises to deduplicate concurrent requests */
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Compute a SHA-256 cache key from an arbitrary set of inputs.
 * The key is a hex string; the original inputs are never stored.
 */
export function makeCacheKey(...parts: string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

/**
 * Get a cached result, or undefined if not present / expired.
 */
export function getCached<T extends CacheValue>(key: string): T | undefined {
  return getAnalyzeCache().get(key) as T | undefined;
}

/**
 * Store a result in the cache.
 */
export function setCached<T extends CacheValue>(key: string, value: T): void {
  getAnalyzeCache().set(key, value);
}

/**
 * Clear the entire cache and in-flight requests (useful in tests).
 */
export function clearCache(): void {
  getAnalyzeCache().clear();
  inFlightRequests.clear();
}

/**
 * Returns the current cache size (number of entries).
 */
export function getCacheSize(): number {
  return getAnalyzeCache().size;
}

/**
 * Coalesce concurrent identical requests into a single promise.
 * If a request for `key` is already in flight, returns that existing promise.
 * Once resolved or rejected, the in-flight entry is cleaned up.
 */
export async function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

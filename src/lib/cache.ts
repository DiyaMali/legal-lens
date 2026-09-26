/**
 * In-memory LRU cache for AI analysis results.
 *
 * WHY: Identical requests (same document text + docType + language + prompt version)
 * should not repeat expensive Gemini API calls. The cache key is a SHA-256 hash,
 * so documents are never stored as plaintext.
 *
 * Limitations (noted in README):
 * - In-memory only: cache is not shared across serverless function instances.
 * - Evicted on cold start. This is acceptable for an MVP; a Redis/Memcached store
 *   would provide shared, persistent caching in production.
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
 * Clear the entire cache (useful in tests).
 */
export function clearCache(): void {
  getAnalyzeCache().clear();
}

/**
 * Returns the current cache size (number of entries).
 */
export function getCacheSize(): number {
  return getAnalyzeCache().size;
}

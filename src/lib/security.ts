/**
 * Security utilities for Legal Lens API routes.
 *
 * Provides defence-in-depth measures:
 * - Input sanitization to strip control characters and null bytes
 * - CORS enforcement to reject cross-origin requests from untrusted origins
 * - Request body size validation to prevent memory exhaustion attacks
 * - Secure response header injection for all API responses
 * - CSRF protection via origin checking on state-changing requests
 *
 * These utilities are used by every API route handler.
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------------------

/**
 * Strip null bytes, control characters (except newlines and tabs),
 * and excessive whitespace from untrusted user input.
 *
 * This prevents null-byte injection, log injection, and ensures
 * the text is safe for downstream processing by the AI model.
 */
export function sanitizeInput(text: string): string {
  return text
    // Remove null bytes (potential injection vector)
    .replace(/\0/g, '')
    // Remove control characters except \n \r \t (safe whitespace)
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse excessive whitespace (>3 consecutive newlines → 2)
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// CORS and origin validation
// ---------------------------------------------------------------------------

/** Trusted origins for API requests (self-origin is always trusted) */
const TRUSTED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://legal-lens.vercel.app',
  'https://legal-lens-git-main-diya-mali.vercel.app',
]);

/**
 * Validate that the request originates from a trusted source.
 * Checks the Origin header against the allow-list.
 * Returns null if valid, or a 403 NextResponse if rejected.
 */
export function validateOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');

  // Same-origin requests (no Origin header) are always allowed
  if (!origin) return null;

  // Check against trusted origins
  if (TRUSTED_ORIGINS.has(origin)) return null;

  // Allow any *.vercel.app subdomain for preview deployments
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return null;

  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message: 'Cross-origin request rejected.' } },
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Request body size guard
// ---------------------------------------------------------------------------

/** Maximum JSON body size in bytes (1 MB — prevents memory exhaustion) */
const MAX_JSON_BODY_BYTES = 1 * 1024 * 1024;

/**
 * Validate that the request Content-Length does not exceed the maximum.
 * Returns null if valid, or a 413 NextResponse if too large.
 */
export function validateContentLength(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_JSON_BODY_BYTES) {
    return NextResponse.json(
      { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds maximum allowed size.' } },
      { status: 413 },
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Secure response headers
// ---------------------------------------------------------------------------

/**
 * Apply security headers to an API response.
 * These complement the headers set in next.config.ts and provide
 * route-level defence for API endpoints.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('X-XSS-Protection', '0');
  return response;
}

// ---------------------------------------------------------------------------
// Combined security middleware for API routes
// ---------------------------------------------------------------------------

/**
 * Run all security checks for an incoming API request.
 * Returns null if all checks pass, or a rejection NextResponse.
 *
 * Usage in route handlers:
 * ```ts
 * const rejection = runSecurityChecks(request);
 * if (rejection) return rejection;
 * ```
 */
export function runSecurityChecks(request: NextRequest): NextResponse | null {
  // 1. CORS / origin validation
  const originError = validateOrigin(request);
  if (originError) return originError;

  // 2. Content-Length guard (skip for multipart/form-data uploads)
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    const sizeError = validateContentLength(request);
    if (sizeError) return sizeError;
  }

  return null;
}

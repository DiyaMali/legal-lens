/**
 * Unit tests for the security utilities module.
 *
 * Covers input sanitization, CORS validation, content-length guards,
 * and secure response header injection.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateOrigin,
  validateContentLength,
  withSecurityHeaders,
  runSecurityChecks,
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------

describe('sanitizeInput', () => {
  it('removes null bytes from input', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld');
  });

  it('removes control characters except newlines and tabs', () => {
    expect(sanitizeInput('hello\x01\x02world')).toBe('helloworld');
    expect(sanitizeInput('hello\nworld')).toBe('hello\nworld');
    expect(sanitizeInput('hello\tworld')).toBe('hello\tworld');
  });

  it('collapses excessive newlines (>3 → 3)', () => {
    expect(sanitizeInput('a\n\n\n\n\nb')).toBe('a\n\n\nb');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('passes through normal text unchanged', () => {
    const normal = 'This is a normal legal document with §1.2 and amounts of $5,000.';
    expect(sanitizeInput(normal)).toBe(normal);
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles string with only control characters', () => {
    expect(sanitizeInput('\0\x01\x02')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// validateOrigin
// ---------------------------------------------------------------------------

describe('validateOrigin', () => {
  it('allows requests with no Origin header (same-origin)', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
    });
    expect(validateOrigin(req)).toBeNull();
  });

  it('allows requests from trusted origins', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    });
    expect(validateOrigin(req)).toBeNull();
  });

  it('allows requests from vercel.app subdomains', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'https://my-preview-123.vercel.app' },
    });
    expect(validateOrigin(req)).toBeNull();
  });

  it('rejects requests from untrusted origins', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'https://evil-site.com' },
    });
    const result = validateOrigin(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// validateContentLength
// ---------------------------------------------------------------------------

describe('validateContentLength', () => {
  it('allows requests within size limit', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'content-length': '1024' },
    });
    expect(validateContentLength(req)).toBeNull();
  });

  it('rejects requests exceeding size limit', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'content-length': '2000000' },
    });
    const result = validateContentLength(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(413);
  });

  it('allows requests without content-length header', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
    });
    expect(validateContentLength(req)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// withSecurityHeaders
// ---------------------------------------------------------------------------

describe('withSecurityHeaders', () => {
  it('adds security headers to response', () => {
    const response = NextResponse.json({ ok: true });
    const secured = withSecurityHeaders(response);

    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
    expect(secured.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate, private');
    expect(secured.headers.get('X-XSS-Protection')).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// runSecurityChecks
// ---------------------------------------------------------------------------

describe('runSecurityChecks', () => {
  it('returns null for valid same-origin requests', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'content-length': '100' },
    });
    expect(runSecurityChecks(req)).toBeNull();
  });

  it('rejects cross-origin requests from untrusted domains', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'https://malicious-site.com' },
    });
    const result = runSecurityChecks(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('skips content-length check for multipart/form-data', () => {
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=----',
        'content-length': '99999999',
      },
    });
    // Should pass because content-length check is skipped for multipart
    expect(runSecurityChecks(req)).toBeNull();
  });
});

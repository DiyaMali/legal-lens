/**
 * POST /api/compare
 *
 * Compares two legal documents (F6).
 * Applies security checks, rate limiting, and input sanitization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompareRequestSchema } from '@/lib/schemas/compare';
import { compareDocuments } from '@/lib/ai/compare';
import { checkRateLimit } from '@/lib/rate-limit';
import { toApiError, makeApiError } from '@/lib/errors';
import { runSecurityChecks, sanitizeInput, withSecurityHeaders } from '@/lib/security';

export const maxDuration = 60;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Security checks (CORS, content-length)
    const securityRejection = runSecurityChecks(request);
    if (securityRejection) return securityRejection;

    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.retryAfterMs ?? 60000) / 1000);
      return withSecurityHeaders(
        NextResponse.json(
          makeApiError('RATE_LIMITED', `Too many requests. Please try again in ${retryAfter} seconds.`),
          { status: 429, headers: { 'Retry-After': String(retryAfter) } },
        ),
      );
    }

    const body: unknown = await request.json();
    const parsed = CompareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(
        NextResponse.json(
          makeApiError('INVALID_INPUT', `Invalid request: ${parsed.error.errors.map((e) => e.message).join(', ')}`),
          { status: 400 },
        ),
      );
    }

    const { docType, language } = parsed.data;

    // Sanitize untrusted inputs
    const textA = sanitizeInput(parsed.data.textA);
    const textB = sanitizeInput(parsed.data.textB);

    const result = await compareDocuments(textA, textB, docType, language);

    return withSecurityHeaders(NextResponse.json(result));
  } catch (err) {
    const { body, status } = toApiError(err);
    return withSecurityHeaders(NextResponse.json(body, { status }));
  }
}

export async function GET(): Promise<NextResponse> {
  return withSecurityHeaders(
    NextResponse.json(makeApiError('METHOD_NOT_ALLOWED', 'Use POST.'), { status: 405 }),
  );
}

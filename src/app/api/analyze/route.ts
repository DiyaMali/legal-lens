/**
 * POST /api/analyze
 *
 * Runs the full document analysis (F2, F3, F4, F7 questions) in one Gemini call.
 * Applies security checks, rate limiting, input sanitization, and caching
 * before calling the model.
 *
 * Request body: { text: string, docType: DocumentType, language: OutputLanguage }
 * Returns: AnalysisResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/schemas/analyze';
import { analyzeDocument } from '@/lib/ai/analyze';
import { checkRateLimit } from '@/lib/rate-limit';
import { toApiError, makeApiError } from '@/lib/errors';
import { runSecurityChecks, sanitizeInput, withSecurityHeaders } from '@/lib/security';

// Allow up to 60 seconds for Gemini to respond
export const maxDuration = 60;

/** Extract the client IP from the request headers (best-effort on serverless) */
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

    // Rate limit check
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.retryAfterMs ?? 60000) / 1000);
      return withSecurityHeaders(
        NextResponse.json(
          makeApiError('RATE_LIMITED', `Too many requests. Please try again in ${retryAfter} seconds.`),
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfter) },
          },
        ),
      );
    }

    // Parse and validate request body
    const body: unknown = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(
        NextResponse.json(
          makeApiError(
            'INVALID_INPUT',
            `Invalid request: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
          ),
          { status: 400 },
        ),
      );
    }

    const { docType, language } = parsed.data;

    // Sanitize untrusted text input before processing
    const text = sanitizeInput(parsed.data.text);

    // Run analysis (includes cache check, Gemini call, verification)
    const result = await analyzeDocument(text, docType, language);

    return withSecurityHeaders(NextResponse.json(result));
  } catch (err) {
    const { body, status } = toApiError(err);
    return withSecurityHeaders(NextResponse.json(body, { status }));
  }
}

export async function GET(): Promise<NextResponse> {
  return withSecurityHeaders(
    NextResponse.json(
      makeApiError('METHOD_NOT_ALLOWED', 'Use POST to analyze a document.'),
      { status: 405 },
    ),
  );
}

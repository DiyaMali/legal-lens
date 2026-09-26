/**
 * POST /api/analyze
 *
 * Runs the full document analysis (F2, F3, F4, F7 questions) in one Gemini call.
 * Applies rate limiting and caching before calling the model.
 *
 * Request body: { text: string, docType: DocumentType, language: OutputLanguage }
 * Returns: AnalysisResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/schemas/analyze';
import { analyzeDocument } from '@/lib/ai/analyze';
import { checkRateLimit } from '@/lib/rate-limit';
import { toApiError, makeApiError } from '@/lib/errors';

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
    // Rate limit check
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.retryAfterMs ?? 60000) / 1000);
      return NextResponse.json(
        makeApiError('RATE_LIMITED', `Too many requests. Please try again in ${retryAfter} seconds.`),
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        },
      );
    }

    // Parse and validate request body
    const body: unknown = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        makeApiError(
          'INVALID_INPUT',
          `Invalid request: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        ),
        { status: 400 },
      );
    }

    const { text, docType, language } = parsed.data;

    // Run analysis (includes cache check, Gemini call, verification)
    const result = await analyzeDocument(text, docType, language);

    return NextResponse.json(result);
  } catch (err) {
    const { body, status } = toApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    makeApiError('METHOD_NOT_ALLOWED', 'Use POST to analyze a document.'),
    { status: 405 },
  );
}

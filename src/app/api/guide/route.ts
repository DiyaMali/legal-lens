import { NextRequest, NextResponse } from 'next/server';
import { GuideRequestSchema } from '@/lib/schemas/guide';
import { handleGuideQuery } from '@/lib/guide/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { toApiError, makeApiError } from '@/lib/errors';

export const maxDuration = 20;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    const body: unknown = await request.json();
    const parsed = GuideRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        makeApiError(
          'INVALID_INPUT',
          `Invalid request: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
        ),
        { status: 400 },
      );
    }

    const msg = parsed.data.message.toLowerCase();
    // Safety check: block attempts to send raw contract documents to the guide chatbot
    if (
      msg.includes('this agreement is made') ||
      msg.includes('whereas the party') ||
      msg.includes('now therefore it is agreed')
    ) {
      return NextResponse.json(
        makeApiError(
          'INVALID_INPUT',
          'The Legal Lens Guide is for app assistance only. To analyze contract text, please use the Analyze Document tool.',
        ),
        { status: 400 },
      );
    }

    const result = await handleGuideQuery(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const { body, status } = toApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    makeApiError('METHOD_NOT_ALLOWED', 'Use POST to send messages to the guide.'),
    { status: 405 },
  );
}

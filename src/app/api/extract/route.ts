/**
 * POST /api/extract
 *
 * Validates and extracts text from an uploaded PDF, TXT, or image file.
 * No AI is used for PDF/TXT — this is pure file validation and text extraction.
 * Image files use Gemini OCR for text extraction.
 *
 * Security: Validates file type via magic bytes, enforces size limits,
 * and sanitizes extracted text output.
 *
 * Returns: { text: string, charCount: number, pageCount?: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFileMetadata } from '@/lib/pdf/validate';
import { extractPdfText, extractTxtText, extractImageText } from '@/lib/pdf/extract';
import { toApiError } from '@/lib/errors';
import { runSecurityChecks, sanitizeInput, withSecurityHeaders } from '@/lib/security';

// Vercel serverless function timeout
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Security checks (CORS — skip content-length for multipart uploads)
    const securityRejection = runSecurityChecks(request);
    if (securityRejection) return securityRejection;

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: { code: 'MISSING_FIELD', message: 'No file provided.' } },
          { status: 400 },
        ),
      );
    }

    const filename = file.name;
    const sizeBytes = file.size;

    // Validate file metadata (extension, size)
    validateFileMetadata(filename, sizeBytes);

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let text: string;
    let pageCount: number | undefined;

    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) {
      text = await extractPdfText(bytes);
    } else if (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp')
    ) {
      const mimeType =
        file.type && file.type.startsWith('image/')
          ? file.type
          : lower.endsWith('.png')
            ? 'image/png'
            : lower.endsWith('.webp')
              ? 'image/webp'
              : 'image/jpeg';
      text = await extractImageText(bytes, mimeType);
    } else {
      text = extractTxtText(bytes);
    }

    // Sanitize extracted text to remove any control characters
    const sanitizedText = sanitizeInput(text);

    return withSecurityHeaders(
      NextResponse.json({
        text: sanitizedText,
        charCount: sanitizedText.length,
        pageCount,
      }),
    );
  } catch (err) {
    const { body, status } = toApiError(err);
    return withSecurityHeaders(NextResponse.json(body, { status }));
  }
}

// Reject non-POST methods
export async function GET(): Promise<NextResponse> {
  return withSecurityHeaders(
    NextResponse.json(
      { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to upload a file.' } },
      { status: 405 },
    ),
  );
}

/**
 * PDF text extraction using unpdf.
 *
 * WHY: unpdf is serverless-friendly (no native binaries), works on Vercel's
 * Node.js runtime, and extracts selectable text from PDF files. It cannot
 * OCR scanned images — that case is handled by returning an empty string,
 * which validateExtractedText() will catch and report clearly.
 */

import {
  validatePdfMagicBytes,
  validateImageMagicBytes,
  validateExtractedText,
} from './validate';
import { extractTextFromImageViaGemini } from '@/lib/ai/client';

/**
 * Extract plain text from a PDF file's raw bytes.
 * Returns the extracted text (trimmed).
 *
 * Throws LegalLensError if:
 * - The file is not a valid PDF (bad magic bytes)
 * - No text could be extracted (scanned PDF)
 */
export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  // Validate magic bytes before expensive extraction
  validatePdfMagicBytes(bytes);

  // Dynamic import keeps unpdf out of client bundles
  const { extractText } = await import('unpdf');

  const { text } = await extractText(bytes, {
    // mergePages: join all pages into one string
    mergePages: true,
  });

  const extractedText = Array.isArray(text) ? text.join('\n') : (text ?? '');

  validateExtractedText(extractedText, true);

  return extractedText.trim();
}

/**
 * Extract text from a plain .txt file's raw bytes.
 * Returns the decoded text (trimmed).
 */
export function extractTxtText(bytes: Uint8Array): string {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  validateExtractedText(text, false);
  return text.trim();
}

/**
 * Extract text from an uploaded document image (PNG, JPG, WebP) using Gemini.
 * Returns the extracted text (trimmed).
 */
export async function extractImageText(bytes: Uint8Array, mimeType: string): Promise<string> {
  validateImageMagicBytes(bytes);
  const text = await extractTextFromImageViaGemini(bytes, mimeType);
  validateExtractedText(text, false);
  return text.trim();
}

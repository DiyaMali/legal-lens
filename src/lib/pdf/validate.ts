/**
 * PDF and TXT file validation utilities.
 *
 * WHY: Validating before any text extraction saves time and prevents misuse.
 * We check: file extension, magic bytes (for PDFs), and file size.
 * These checks run entirely without AI — fast and cheap.
 */

import { LegalLensError, ErrorCode } from '@/lib/errors';
import {
  MAX_FILE_BYTES,
  MAX_TEXT_CHARS,
  PDF_MAGIC_BYTES,
  ACCEPTED_EXTENSIONS,
} from '@/lib/config';

/**
 * Validate an uploaded file's extension and size.
 * Throws LegalLensError with a specific code on failure.
 *
 * @param filename - The original filename from the upload
 * @param sizeBytes - The byte size of the file
 */
export function validateFileMetadata(filename: string, sizeBytes: number): void {
  // Check size first (cheapest check)
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new LegalLensError(
      ErrorCode.FILE_TOO_LARGE,
      `File is ${(sizeBytes / 1024 / 1024).toFixed(1)} MB. Maximum allowed is 4 MB.`,
      400,
    );
  }

  // Check extension
  const lower = filename.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasValidExtension) {
    throw new LegalLensError(
      ErrorCode.INVALID_FILE_TYPE,
      'File type not supported. Please upload a .pdf, .txt, .png, .jpg, or .webp file.',
      400,
    );
  }
}

/**
 * Validate that a PDF file's bytes start with the PDF magic bytes (%PDF).
 * This prevents malicious files with a .pdf extension from being processed.
 *
 * @param bytes - The first few bytes of the file (at least 4)
 */
export function validatePdfMagicBytes(bytes: Uint8Array): void {
  const header = new TextDecoder().decode(bytes.slice(0, 4));
  if (header !== PDF_MAGIC_BYTES) {
    throw new LegalLensError(
      ErrorCode.INVALID_FILE_TYPE,
      'The file does not appear to be a valid PDF (invalid header).',
      400,
    );
  }
}

/**
 * Validate that an image file's bytes match common image formats (PNG, JPEG, WebP).
 */
export function validateImageMagicBytes(bytes: Uint8Array): void {
  if (bytes.length < 12) {
    throw new LegalLensError(
      ErrorCode.INVALID_FILE_TYPE,
      'The file is too small to be a valid image.',
      400,
    );
  }

  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp = isRiff && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

  if (!isPng && !isJpeg && !isWebp) {
    throw new LegalLensError(
      ErrorCode.INVALID_FILE_TYPE,
      'The file does not appear to be a valid image (invalid header).',
      400,
    );
  }
}

/**
 * Validate extracted text length.
 * Throws if the text is empty (including scanned PDFs) or too long.
 *
 * @param text - The extracted text content
 * @param isPdf - Whether the source was a PDF (to give a better error for scanned PDFs)
 */
export function validateExtractedText(text: string, isPdf: boolean): void {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    if (isPdf) {
      throw new LegalLensError(
        ErrorCode.SCANNED_PDF,
        'No text could be extracted from this PDF. It may be a scanned document with only images. ' +
          'Please use a PDF with selectable text, or paste the text directly.',
        422,
      );
    }
    throw new LegalLensError(ErrorCode.EMPTY_CONTENT, 'The file appears to be empty.', 400);
  }

  if (trimmed.length > MAX_TEXT_CHARS) {
    throw new LegalLensError(
      ErrorCode.TEXT_TOO_LONG,
      `Document is too long (${trimmed.length.toLocaleString()} characters). ` +
        `Maximum allowed is ${MAX_TEXT_CHARS.toLocaleString()} characters. ` +
        'Please paste the most relevant sections only.',
      400,
    );
  }
}

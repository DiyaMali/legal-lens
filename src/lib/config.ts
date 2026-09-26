/**
 * Central configuration constants for Legal Lens.
 *
 * WHY: Keeping all limits, model IDs, and tuning parameters in one place means
 * they can be audited, tested, and changed without hunting through the codebase.
 * Constants are typed and exported; no magic numbers elsewhere.
 */

// ---------------------------------------------------------------------------
// Gemini model
// ---------------------------------------------------------------------------

/**
 * The Gemini model to use for all AI calls.
 * Overridable via GEMINI_MODEL environment variable (server-side only).
 * Using gemini-2.0-flash: stable Flash-class model with structured JSON output,
 * long context window (1M tokens), and multilingual capability.
 */
export const GEMINI_MODEL = process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash';

// ---------------------------------------------------------------------------
// Input limits
// ---------------------------------------------------------------------------

/** Maximum file upload size in bytes (4 MB — Vercel body limit is ~4.5 MB) */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Maximum document text length in characters before we reject the input */
export const MAX_TEXT_CHARS = 80_000;

/** Maximum question length for Q&A (prevents prompt stuffing) */
export const MAX_QUESTION_CHARS = 1_000;

/** Maximum conversation history turns sent to the server */
export const MAX_HISTORY_TURNS = 2;

/** Maximum total character length of history sent to the server */
export const MAX_HISTORY_CHARS = 4_000;

// ---------------------------------------------------------------------------
// AI output limits
// ---------------------------------------------------------------------------

/** Maximum output tokens for the analyze call (clauses + facts + missing) */
export const ANALYZE_MAX_OUTPUT_TOKENS = 8_192;

/** Maximum output tokens for the Q&A call */
export const ASK_MAX_OUTPUT_TOKENS = 2_048;

/** Maximum output tokens for the compare call */
export const COMPARE_MAX_OUTPUT_TOKENS = 8_192;

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/** Maximum AI API requests per IP per minute (in-memory, best-effort on serverless) */
export const RATE_LIMIT_MAX_REQUESTS = 10;

/** Rate limit window in milliseconds */
export const RATE_LIMIT_WINDOW_MS = 60_000;

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

/** Maximum number of analysis results to keep in the LRU cache */
export const CACHE_MAX_SIZE = 50;

/** Cache entry TTL in milliseconds (1 hour) */
export const CACHE_TTL_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Accepted file types
// ---------------------------------------------------------------------------

/** MIME types accepted for upload */
export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

/** File extensions accepted for upload */
export const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
] as const;

/**
 * PDF magic bytes (first 4 bytes of a valid PDF file).
 * Used to verify file type independent of the extension/MIME type.
 */
export const PDF_MAGIC_BYTES = '%PDF';

// ---------------------------------------------------------------------------
// Supported document types and output languages
// ---------------------------------------------------------------------------

export const DOCUMENT_TYPES = [
  'rental',
  'employment',
  'loan',
  'terms_of_service',
  'other',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const OUTPUT_LANGUAGES = ['en', 'hi', 'mr'] as const;

export type OutputLanguage = (typeof OUTPUT_LANGUAGES)[number];

/** Human-readable labels for output languages */
export const LANGUAGE_LABELS: Record<OutputLanguage, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  mr: 'मराठी (Marathi)',
};

/** Human-readable labels for document types */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rental: 'Rental / Lease Agreement',
  employment: 'Employment / Offer Letter',
  loan: 'Loan Agreement',
  terms_of_service: 'Terms of Service',
  other: 'Other Legal Document',
};

// ---------------------------------------------------------------------------
// Disclaimer text (single source of truth, used across all screens)
// ---------------------------------------------------------------------------

/**
 * The standard disclaimer that must appear on every results screen,
 * in the Q&A panel, in the compare view, and in the exported brief.
 */
export const DISCLAIMER =
  'Legal Lens provides general information to help you understand documents. ' +
  'It is not legal advice and does not create a lawyer–client relationship. ' +
  'For decisions with legal consequences, consult a qualified lawyer.';

/** Short privacy note for the input screen */
export const PRIVACY_NOTE =
  "Documents are sent to Google's Gemini API for processing. " +
  'Avoid uploading highly sensitive personal data (e.g., Aadhaar, bank account details). ' +
  'Documents are never stored or logged by Legal Lens.';

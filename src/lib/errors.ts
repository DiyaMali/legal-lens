/**
 * Typed error model for Legal Lens API routes.
 *
 * WHY: A consistent error shape means the UI can map codes to friendly messages
 * without parsing raw strings, and the server never leaks stack traces or
 * internal details to the client.
 *
 * Every API route returns:
 *   Success: { data: T }
 *   Failure: { error: { code: ErrorCode, message: string } }
 */

// ---------------------------------------------------------------------------
// Error codes (string enum for clear HTTP logs and client mapping)
// ---------------------------------------------------------------------------

export const ErrorCode = {
  // Input validation
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  EMPTY_CONTENT: 'EMPTY_CONTENT',
  SCANNED_PDF: 'SCANNED_PDF',
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // AI / model errors
  MODEL_ERROR: 'MODEL_ERROR',
  MODEL_INVALID_RESPONSE: 'MODEL_INVALID_RESPONSE',
  MODEL_TIMEOUT: 'MODEL_TIMEOUT',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ---------------------------------------------------------------------------
// Error response shape
// ---------------------------------------------------------------------------

/** The standard error envelope returned by all API routes */
export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// Application error class
// ---------------------------------------------------------------------------

/**
 * LegalLensError is thrown inside server-side logic.
 * Route handlers catch it and convert to an ApiError response.
 * Stack traces are never forwarded to the client.
 */
export class LegalLensError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'LegalLensError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LegalLensError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Error factory helpers
// ---------------------------------------------------------------------------

/** Build an ApiError JSON body */
export function makeApiError(code: ErrorCode, message: string): ApiError {
  return { error: { code, message } };
}

/**
 * Convert any thrown value to an ApiError + HTTP status.
 * Never exposes stack traces or raw error messages to the client.
 */
export function toApiError(err: unknown): { body: ApiError; status: number } {
  if (err instanceof LegalLensError) {
    return {
      body: makeApiError(err.code, err.message),
      status: err.statusCode,
    };
  }

  // Unknown error — log server-side only, send a safe message to the client
  console.error('[LegalLens] Unhandled error:', err);
  return {
    body: makeApiError(ErrorCode.INTERNAL_ERROR, 'An unexpected error occurred. Please try again.'),
    status: 500,
  };
}

// ---------------------------------------------------------------------------
// User-facing messages for each error code
// ---------------------------------------------------------------------------

/**
 * Maps error codes to user-friendly messages.
 * The UI should prefer these over raw API messages for display.
 */
export const USER_ERROR_MESSAGES: Record<ErrorCode, string> = {
  FILE_TOO_LARGE: 'The file is too large. Please upload a file under 4 MB.',
  INVALID_FILE_TYPE: 'Only PDF and TXT files are supported. Please choose a different file.',
  EMPTY_CONTENT: 'The file appears to be empty. Please check the file and try again.',
  SCANNED_PDF:
    'This PDF appears to contain only scanned images, not selectable text. ' +
    'Please use a PDF with digital text, or paste the text directly.',
  TEXT_TOO_LONG:
    'The document is too long to analyse in one go (max 80,000 characters). ' +
    'Please paste the relevant sections only.',
  INVALID_INPUT: 'Some input values are invalid. Please check the form and try again.',
  MISSING_FIELD: 'A required field is missing. Please complete the form and try again.',
  RATE_LIMITED:
    'Too many requests. Please wait a moment before trying again.',
  MODEL_ERROR: 'The AI service encountered an error. Please try again in a moment.',
  MODEL_INVALID_RESPONSE:
    'The AI returned an unexpected response. Please try again. ' +
    'If this persists, try rephrasing the question.',
  MODEL_TIMEOUT: 'The AI request timed out. Please try again.',
  INTERNAL_ERROR: 'An unexpected server error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  METHOD_NOT_ALLOWED: 'This HTTP method is not supported for this endpoint.',
};

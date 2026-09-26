import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  LegalLensError,
  makeApiError,
  toApiError,
  USER_ERROR_MESSAGES,
} from '@/lib/errors';

describe('errors module', () => {
  it('creates a LegalLensError with default status 400', () => {
    const err = new LegalLensError(ErrorCode.INVALID_INPUT, 'Invalid');
    expect(err.name).toBe('LegalLensError');
    expect(err.code).toBe(ErrorCode.INVALID_INPUT);
    expect(err.message).toBe('Invalid');
    expect(err.statusCode).toBe(400);
  });

  it('creates a LegalLensError with custom status', () => {
    const err = new LegalLensError(ErrorCode.MODEL_ERROR, 'Model failed', 502);
    expect(err.code).toBe(ErrorCode.MODEL_ERROR);
    expect(err.statusCode).toBe(502);
  });

  it('makes an ApiError payload', () => {
    const payload = makeApiError(ErrorCode.FILE_TOO_LARGE, 'File too large');
    expect(payload).toEqual({
      error: {
        code: ErrorCode.FILE_TOO_LARGE,
        message: 'File too large',
      },
    });
  });

  it('converts LegalLensError to ApiError response', () => {
    const err = new LegalLensError(ErrorCode.SCANNED_PDF, 'Scanned PDF', 422);
    const res = toApiError(err);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe(ErrorCode.SCANNED_PDF);
    expect(res.body.error.message).toBe('Scanned PDF');
  });

  it('converts unknown error to 500 INTERNAL_ERROR response without leaking details', () => {
    const res = toApiError(new Error('Secret internal DB crash'));
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(res.body.error.message).toContain('unexpected error');
  });

  it('has a user error message for every defined ErrorCode', () => {
    for (const code of Object.values(ErrorCode)) {
      expect(USER_ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof USER_ERROR_MESSAGES[code]).toBe('string');
      expect(USER_ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    }
  });
});

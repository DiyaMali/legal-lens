/**
 * Unit tests for file validation (src/lib/pdf/validate.ts)
 */

import { describe, it, expect } from 'vitest';
import {
  validateFileMetadata,
  validatePdfMagicBytes,
  validateImageMagicBytes,
  validateExtractedText,
} from '@/lib/pdf/validate';
import { LegalLensError } from '@/lib/errors';
import { MAX_FILE_BYTES, MAX_TEXT_CHARS } from '@/lib/config';

describe('validateFileMetadata', () => {
  it('passes for a valid PDF under size limit', () => {
    expect(() => validateFileMetadata('document.pdf', 1024)).not.toThrow();
  });

  it('passes for a valid TXT file', () => {
    expect(() => validateFileMetadata('agreement.txt', 500)).not.toThrow();
  });

  it('throws FILE_TOO_LARGE for oversized files', () => {
    expect(() => validateFileMetadata('big.pdf', MAX_FILE_BYTES + 1)).toThrow(LegalLensError);
    try {
      validateFileMetadata('big.pdf', MAX_FILE_BYTES + 1);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('FILE_TOO_LARGE');
    }
  });

  it('passes for a valid PNG, JPG, JPEG, or WEBP file', () => {
    expect(() => validateFileMetadata('agreement.png', 1024)).not.toThrow();
    expect(() => validateFileMetadata('agreement.jpg', 1024)).not.toThrow();
    expect(() => validateFileMetadata('agreement.jpeg', 1024)).not.toThrow();
    expect(() => validateFileMetadata('agreement.webp', 1024)).not.toThrow();
  });

  it('throws INVALID_FILE_TYPE for unsupported extensions', () => {
    expect(() => validateFileMetadata('document.docx', 100)).toThrow(LegalLensError);
    try {
      validateFileMetadata('document.docx', 100);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('INVALID_FILE_TYPE');
    }
  });

  it('throws INVALID_FILE_TYPE for .exe files', () => {
    expect(() => validateFileMetadata('virus.exe', 100)).toThrow(LegalLensError);
  });

  it('is case-insensitive for extensions', () => {
    expect(() => validateFileMetadata('DOCUMENT.PDF', 1024)).not.toThrow();
    expect(() => validateFileMetadata('AGREEMENT.TXT', 1024)).not.toThrow();
    expect(() => validateFileMetadata('SCAN.PNG', 1024)).not.toThrow();
  });
});

describe('validatePdfMagicBytes', () => {
  it('passes for valid PDF bytes', () => {
    const bytes = new TextEncoder().encode('%PDF-1.4 rest of file');
    expect(() => validatePdfMagicBytes(bytes)).not.toThrow();
  });

  it('throws INVALID_FILE_TYPE for non-PDF bytes', () => {
    const bytes = new TextEncoder().encode('PK\x03\x04 this is a zip file');
    expect(() => validatePdfMagicBytes(bytes)).toThrow(LegalLensError);
    try {
      validatePdfMagicBytes(bytes);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('INVALID_FILE_TYPE');
    }
  });
});

describe('validateImageMagicBytes', () => {
  it('passes for valid PNG bytes', () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(() => validateImageMagicBytes(bytes)).not.toThrow();
  });

  it('passes for valid JPEG bytes', () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
    expect(() => validateImageMagicBytes(bytes)).not.toThrow();
  });

  it('passes for valid WebP bytes', () => {
    const bytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0, 0, 0, 0,
      0x57, 0x45, 0x42, 0x50, // WEBP
    ]);
    expect(() => validateImageMagicBytes(bytes)).not.toThrow();
  });

  it('throws INVALID_FILE_TYPE for bad image header or too short', () => {
    const shortBytes = new Uint8Array([1, 2, 3]);
    expect(() => validateImageMagicBytes(shortBytes)).toThrow(LegalLensError);
    const badBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(() => validateImageMagicBytes(badBytes)).toThrow(LegalLensError);
  });
});

describe('validateExtractedText', () => {
  it('passes for non-empty text within limits', () => {
    expect(() => validateExtractedText('This is a valid document.', false)).not.toThrow();
  });

  it('throws SCANNED_PDF for empty text from a PDF', () => {
    expect(() => validateExtractedText('', true)).toThrow(LegalLensError);
    try {
      validateExtractedText('', true);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('SCANNED_PDF');
    }
  });

  it('throws EMPTY_CONTENT for empty text from a TXT', () => {
    expect(() => validateExtractedText('   ', false)).toThrow(LegalLensError);
    try {
      validateExtractedText('   ', false);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('EMPTY_CONTENT');
    }
  });

  it('throws TEXT_TOO_LONG for text exceeding the limit', () => {
    const longText = 'a'.repeat(MAX_TEXT_CHARS + 1);
    expect(() => validateExtractedText(longText, false)).toThrow(LegalLensError);
    try {
      validateExtractedText(longText, false);
    } catch (e) {
      expect((e as LegalLensError).code).toBe('TEXT_TOO_LONG');
    }
  });

  it('passes for text exactly at the limit', () => {
    const maxText = 'a'.repeat(MAX_TEXT_CHARS);
    expect(() => validateExtractedText(maxText, false)).not.toThrow();
  });
});

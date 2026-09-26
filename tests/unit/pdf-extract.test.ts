import { describe, it, expect, vi } from 'vitest';
import { extractTxtText, extractPdfText, extractImageText } from '@/lib/pdf/extract';
import { LegalLensError, ErrorCode } from '@/lib/errors';
import * as clientModule from '@/lib/ai/client';

vi.mock('unpdf', () => ({
  extractText: vi.fn(async (bytes: Uint8Array) => {
    // If bytes contain mock text pattern
    const str = new TextDecoder().decode(bytes);
    if (str.includes('EMPTY_PDF')) {
      return { text: '' };
    }
    return { text: 'Extracted PDF text content here.' };
  }),
}));

describe('extractTxtText', () => {
  it('extracts utf-8 text successfully', () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('This is a test plain text document.');
    const result = extractTxtText(bytes);
    expect(result).toBe('This is a test plain text document.');
  });

  it('throws on empty text file', () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('    ');
    expect(() => extractTxtText(bytes)).toThrow(LegalLensError);
  });
});

describe('extractPdfText', () => {
  it('validates magic bytes and extracts text from valid PDF', async () => {
    // %PDF- header
    const header = new TextEncoder().encode('%PDF-1.4 valid content');
    const result = await extractPdfText(header);
    expect(result).toBe('Extracted PDF text content here.');
  });

  it('throws INVALID_FILE_TYPE on bad magic bytes', async () => {
    const invalidBytes = new TextEncoder().encode('NOT A PDF');
    await expect(extractPdfText(invalidBytes)).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_FILE_TYPE }),
    );
  });

  it('throws SCANNED_PDF when no text could be extracted', async () => {
    const emptyPdfBytes = new TextEncoder().encode('%PDF-1.4 EMPTY_PDF');
    await expect(extractPdfText(emptyPdfBytes)).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.SCANNED_PDF }),
    );
  });
});

describe('extractImageText', () => {
  it('validates image bytes and extracts text via Gemini OCR', async () => {
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    vi.spyOn(clientModule, 'extractTextFromImageViaGemini').mockResolvedValue(
      'Extracted image contract text.',
    );

    const result = await extractImageText(pngBytes, 'image/png');
    expect(result).toBe('Extracted image contract text.');
  });

  it('throws INVALID_FILE_TYPE on bad image header', async () => {
    const badBytes = new Uint8Array([1, 2, 3]);
    await expect(extractImageText(badBytes, 'image/png')).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_FILE_TYPE }),
    );
  });
});

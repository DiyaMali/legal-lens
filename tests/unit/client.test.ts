import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateStructured,
  resetClientForTesting,
  extractTextFromImageViaGemini,
} from '@/lib/ai/client';
import { LegalLensError, ErrorCode } from '@/lib/errors';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function (this: { models: { generateContent: typeof mockGenerateContent } }) {
      this.models = {
        generateContent: mockGenerateContent,
      };
    }),
  };
});

describe('AI client (generateStructured)', () => {
  const originalKey = process.env['GEMINI_API_KEY'];

  beforeEach(() => {
    resetClientForTesting();
    process.env['GEMINI_API_KEY'] = 'test-valid-api-key-123';
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    resetClientForTesting();
    process.env['GEMINI_API_KEY'] = originalKey;
  });

  it('successfully returns parsed JSON on model response', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ message: 'success' }),
    });

    const result = await generateStructured({
      systemInstruction: 'sys',
      userPrompt: 'usr',
      responseSchema: {},
    });

    expect(result).toEqual({ message: 'success' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          thinkingConfig: { thinkingBudget: 0 },
        }),
      }),
    );
  });

  it('regression: cleanly parses JSON wrapped in markdown code blocks', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n{\n  "message": "fenced_json_success"\n}\n```',
    });

    const result = await generateStructured({
      systemInstruction: 'sys',
      userPrompt: 'usr',
      responseSchema: {},
    });

    expect(result).toEqual({ message: 'fenced_json_success' });
  });

  it('throws MODEL_INVALID_RESPONSE if returned text is empty', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '',
    });

    await expect(
      generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        responseSchema: {},
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.MODEL_INVALID_RESPONSE }),
    );
  });

  it('throws MODEL_INVALID_RESPONSE if returned text is invalid JSON', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'not-json-content',
    });

    await expect(
      generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        responseSchema: {},
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.MODEL_INVALID_RESPONSE }),
    );
  });

  it('retries once on transient errors (UNAVAILABLE / timeout)', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error('503 UNAVAILABLE transient error'))
      .mockResolvedValueOnce({
        text: JSON.stringify({ retried: true }),
      });

    const result = await generateStructured({
      systemInstruction: 'sys',
      userPrompt: 'usr',
      responseSchema: {},
    });

    expect(result).toEqual({ retried: true });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('maps unhandled errors to MODEL_ERROR', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Fatal API crash'));

    await expect(
      generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        responseSchema: {},
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.MODEL_ERROR }),
    );
  });
});

describe('extractTextFromImageViaGemini', () => {
  const originalKey = process.env['GEMINI_API_KEY'];

  beforeEach(() => {
    resetClientForTesting();
    process.env['GEMINI_API_KEY'] = 'test-valid-api-key-123';
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    resetClientForTesting();
    process.env['GEMINI_API_KEY'] = originalKey;
  });

  it('successfully extracts text from image bytes', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'Extracted contract content',
    });

    const bytes = new Uint8Array([1, 2, 3]);
    const result = await extractTextFromImageViaGemini(bytes, 'image/png');
    expect(result).toBe('Extracted contract content');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('throws EMPTY_CONTENT if returned text is empty', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '',
    });

    const bytes = new Uint8Array([1, 2, 3]);
    await expect(
      extractTextFromImageViaGemini(bytes, 'image/png'),
    ).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.EMPTY_CONTENT }),
    );
  });
});

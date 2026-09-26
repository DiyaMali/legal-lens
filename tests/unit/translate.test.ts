import { describe, it, expect, vi } from 'vitest';
import { TranslateRequestSchema, TranslateResponseSchema } from '@/lib/schemas/translate';

describe('Translate Schemas', () => {
  it('validates a correct TranslateRequest', () => {
    const valid = {
      text: 'The security deposit is Rs 50,000 refundable on termination.',
      targetLanguage: 'hi',
      sourceLanguage: 'en',
    };
    const parsed = TranslateRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid target language', () => {
    const invalid = {
      text: 'Sample text',
      targetLanguage: 'fr',
    };
    const parsed = TranslateRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects empty text', () => {
    const invalid = {
      text: '',
      targetLanguage: 'mr',
    };
    const parsed = TranslateRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates a correct TranslateResponse', () => {
    const validResponse = {
      translatedText: 'सुरक्षा ठेव ₹५०,००० आहे जी करार संपल्यावर परत केली जाईल.',
      sourceLanguage: 'en',
      targetLanguage: 'mr',
    };
    const parsed = TranslateResponseSchema.safeParse(validResponse);
    expect(parsed.success).toBe(true);
  });
});

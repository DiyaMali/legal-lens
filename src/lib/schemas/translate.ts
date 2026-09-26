import { z } from 'zod';
import { OUTPUT_LANGUAGES } from '@/lib/config';

export const TranslateRequestSchema = z.object({
  text: z.string().min(1).max(50_000),
  targetLanguage: z.enum(OUTPUT_LANGUAGES),
  sourceLanguage: z.string().optional(),
});

export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;

export const TranslateResponseSchema = z.object({
  translatedText: z.string().min(1),
  sourceLanguage: z.string(),
  targetLanguage: z.enum(OUTPUT_LANGUAGES),
});

export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;

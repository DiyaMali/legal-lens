import 'server-only';
import { generateStructured } from './client';
import { TranslateRequest, TranslateResponse, TranslateResponseSchema } from '@/lib/schemas/translate';
import { LANGUAGE_LABELS } from '@/lib/config';

const TRANSLATE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    translatedText: { type: 'STRING' },
    sourceLanguage: { type: 'STRING' },
    targetLanguage: { type: 'STRING', enum: ['en', 'hi', 'mr'] },
  },
  required: ['translatedText', 'sourceLanguage', 'targetLanguage'],
};

export async function translateLegalText(req: TranslateRequest): Promise<TranslateResponse> {
  const targetLabel = LANGUAGE_LABELS[req.targetLanguage];

  const systemInstruction =
    'You are a professional multilingual legal translator and clarity specialist. ' +
    `Your task is to accurately translate legal text into ${targetLabel} (${req.targetLanguage}). ` +
    'Requirements:\n' +
    '1. Translate faithfully into plain, easy-to-understand language.\n' +
    '2. Keep monetary values, dates, statutory references, and names exact.\n' +
    '3. Do not add assumptions, external knowledge, or legal opinions.\n' +
    '4. Output ONLY valid JSON matching the response schema.';

  const userPrompt =
    `Translate the following text into ${targetLabel} (${req.targetLanguage}):\n\n` +
    `Source text:\n"""\n${req.text}\n"""\n\n` +
    (req.sourceLanguage ? `Source Language hint: ${req.sourceLanguage}\n` : '');

  const raw = await generateStructured({
    systemInstruction,
    userPrompt,
    responseSchema: TRANSLATE_RESPONSE_SCHEMA,
    maxOutputTokens: 2048,
  });

  return TranslateResponseSchema.parse(raw);
}

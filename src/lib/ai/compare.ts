/**
 * Document comparison logic (F6).
 */

import 'server-only';
import { generateStructured, COMPARE_MAX_OUTPUT_TOKENS } from './client';
import { buildCompareSystemPrompt, buildCompareUserPrompt } from './prompts';
import { ModelCompareSchema, CompareResponse } from '@/lib/schemas/compare';
import { DocumentType, OutputLanguage } from '@/lib/config';
import { LegalLensError, ErrorCode } from '@/lib/errors';

const COMPARE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          inDocA: { type: 'string', nullable: true },
          inDocB: { type: 'string', nullable: true },
          difference: { type: 'string' },
          riskChange: {
            type: 'string',
            enum: ['higher_in_a', 'higher_in_b', 'similar', 'unclear'],
          },
        },
        required: ['topic', 'difference', 'riskChange'],
      },
    },
  },
  required: ['summary', 'items'],
};

/**
 * Compare two legal documents and return a structured list of differences.
 */
export async function compareDocuments(
  textA: string,
  textB: string,
  docType: DocumentType,
  language: OutputLanguage,
): Promise<CompareResponse> {
  const raw = await generateStructured({
    systemInstruction: buildCompareSystemPrompt(),
    userPrompt: buildCompareUserPrompt(textA, textB, docType, language),
    responseSchema: COMPARE_RESPONSE_SCHEMA,
    maxOutputTokens: COMPARE_MAX_OUTPUT_TOKENS,
  });

  const parsed = ModelCompareSchema.safeParse(raw);
  if (!parsed.success) {
    throw new LegalLensError(
      ErrorCode.MODEL_INVALID_RESPONSE,
      'The AI returned an unexpected response format for comparison.',
      502,
    );
  }

  return {
    ...parsed.data,
    docType,
    language,
  };
}

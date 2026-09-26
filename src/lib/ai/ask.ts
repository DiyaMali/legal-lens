/**
 * Grounded Q&A logic (F5).
 *
 * The model must answer only from the provided document text.
 * Citations are verified in code (not by the model).
 * If the answer is not in the document, returns notInDocument=true.
 */

import 'server-only';
import { generateStructured, ASK_MAX_OUTPUT_TOKENS } from './client';
import { buildAskSystemPrompt, buildAskUserPrompt } from './prompts';
import { verifyQuote } from './verify';
import { ModelAskSchema, AskResponse } from '@/lib/schemas/ask';
import type { HistoryTurn } from '@/lib/schemas/ask';
import { OutputLanguage } from '@/lib/config';
import { LegalLensError, ErrorCode } from '@/lib/errors';

const ASK_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
        },
        required: ['quote'],
      },
    },
    notInDocument: { type: 'boolean' },
  },
  required: ['answer', 'citations', 'notInDocument'],
};

/**
 * Answer a question grounded in the provided document.
 */
export async function askQuestion(
  text: string,
  question: string,
  language: OutputLanguage,
  history?: HistoryTurn[],
): Promise<AskResponse> {
  const raw = await generateStructured({
    systemInstruction: buildAskSystemPrompt(),
    userPrompt: buildAskUserPrompt(text, question, language, history),
    responseSchema: ASK_RESPONSE_SCHEMA,
    maxOutputTokens: ASK_MAX_OUTPUT_TOKENS,
  });

  const parsed = ModelAskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new LegalLensError(
      ErrorCode.MODEL_INVALID_RESPONSE,
      'The AI returned an unexpected response format for Q&A.',
      502,
    );
  }

  const modelResult = parsed.data;

  // Verify citations in code
  const citations = modelResult.citations.map((c) => ({
    quote: c.quote,
    verified: verifyQuote(text, c.quote),
  }));

  return {
    answer: modelResult.answer,
    citations,
    notInDocument: modelResult.notInDocument,
  };
}

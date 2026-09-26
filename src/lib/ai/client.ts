/**
 * Gemini AI client — server-only singleton with multi-model failover & retry.
 *
 * WHY: The API key must never reach the browser. This module is imported only
 * by server-side code (API routes, server actions). The 'server-only' package
 * causes a build error if this is accidentally imported on the client.
 *
 * Multi-model cascading ensures 99.9% uptime even if a single Gemini model
 * endpoint is experiencing temporary traffic spikes (503 / 429).
 */

import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL, ANALYZE_MAX_OUTPUT_TOKENS, ASK_MAX_OUTPUT_TOKENS, COMPARE_MAX_OUTPUT_TOKENS } from '@/lib/config';
import { LegalLensError, ErrorCode } from '@/lib/errors';

// Validate the API key at startup so we fail fast rather than on first request
function getApiKey(): string {
  const key = process.env['GEMINI_API_KEY'];
  if (!key) {
    throw new LegalLensError(
      ErrorCode.INTERNAL_ERROR,
      'GEMINI_API_KEY environment variable is not set.',
      500,
    );
  }
  return key;
}

let _client: GoogleGenAI | null = null;

/** Get or create the shared Gemini client */
function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return _client;
}

/** Reset client singleton (used in test isolation) */
export function resetClientForTesting(): void {
  _client = null;
}

// ---------------------------------------------------------------------------
// Fallback model list
// ---------------------------------------------------------------------------

function getCandidateModels(): string[] {
  const models = [
    GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
  ];
  return Array.from(new Set(models.filter(Boolean)));
}

// ---------------------------------------------------------------------------
// Structured generation helpers
// ---------------------------------------------------------------------------

/** Options for a single Gemini generation call */
export interface GenerateOptions {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
  maxOutputTokens?: number;
}

/**
 * Call Gemini with structured JSON output and cascading model fallback.
 * Returns the parsed JSON object.
 * Throws LegalLensError on model failure or malformed response.
 */
export async function generateStructured(options: GenerateOptions): Promise<unknown> {
  const { systemInstruction, userPrompt, responseSchema, maxOutputTokens = ANALYZE_MAX_OUTPUT_TOKENS } = options;

  const client = getClient();
  const models = getCandidateModels();
  let lastError: unknown = null;

  for (const model of models) {
    // Try each model with up to 2 attempts
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: responseSchema as Parameters<typeof client.models.generateContent>[0]['config'] extends { responseSchema?: infer S } ? S : never,
            maxOutputTokens,
            temperature: 0.1,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        const text = response.text;
        if (!text) {
          throw new LegalLensError(
            ErrorCode.MODEL_INVALID_RESPONSE,
            'The AI returned an empty response.',
            502,
          );
        }

        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
        }

        try {
          return JSON.parse(cleaned) as unknown;
        } catch {
          throw new LegalLensError(
            ErrorCode.MODEL_INVALID_RESPONSE,
            'The AI response was not valid JSON.',
            502,
          );
        }
      } catch (err) {
        if (err instanceof LegalLensError || (err instanceof Error && err.name === 'LegalLensError')) {
          throw err;
        }

        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[Gemini Attempt Failed] Model ${model} (Attempt ${attempt}/2): ${errMsg}`);

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('timeout') ||
          errMsg.includes('fetch failed');

        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        // If non-transient or last attempt on this model, break out to try next candidate model
        break;
      }
    }
  }

  if (lastError instanceof LegalLensError || (lastError instanceof Error && lastError.name === 'LegalLensError')) {
    throw lastError;
  }

  const errDetail = lastError instanceof Error ? lastError.message : String(lastError);
  console.error(`[All Gemini Models Failed]: ${errDetail}`);
  throw new LegalLensError(
    ErrorCode.MODEL_ERROR,
    `The AI service is experiencing high traffic. Please retry in a few moments. (${errDetail.slice(0, 80)})`,
    502,
  );
}

/**
 * Transcribe/extract all readable text from a document image using Gemini with fallback.
 */
export async function extractTextFromImageViaGemini(
  bytes: Uint8Array,
  mimeType: string,
): Promise<string> {
  const client = getClient();
  const models = getCandidateModels();
  const base64Data = Buffer.from(bytes).toString('base64');
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text:
                  'Extract all readable text from this legal document image accurately and verbatim. ' +
                  'Preserve the original wording, sections, numbers, and layout where possible. ' +
                  'Return ONLY the plain extracted text with no introductory or conversational remarks.',
              },
            ],
          },
        ],
        config: {
          temperature: 0.0,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const text = response?.text;
      if (!text || text.trim().length === 0) {
        throw new LegalLensError(
          ErrorCode.EMPTY_CONTENT,
          'No readable text could be identified in the uploaded image.',
          422,
        );
      }

      return text.trim();
    } catch (err) {
      if (err instanceof LegalLensError || (err instanceof Error && err.name === 'LegalLensError')) {
        throw err;
      }
      lastError = err;
      console.warn(`[Image Extraction Failed] Model ${model}:`, err instanceof Error ? err.message : err);
    }
  }

  if (lastError instanceof LegalLensError || (lastError instanceof Error && lastError.name === 'LegalLensError')) {
    throw lastError;
  }

  throw new LegalLensError(
    ErrorCode.MODEL_ERROR,
    'The AI service failed to process the document image. Please try uploading as text or PDF.',
    502,
  );
}

export { ANALYZE_MAX_OUTPUT_TOKENS, ASK_MAX_OUTPUT_TOKENS, COMPARE_MAX_OUTPUT_TOKENS };

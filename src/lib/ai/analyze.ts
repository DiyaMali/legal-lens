/**
 * Core analyze logic: single Gemini call covering F2, F3, F4, and F7 questions.
 *
 * WHY one call: Making one call for all four features is more efficient
 * (fewer API round-trips, lower latency, lower cost) and the combined context
 * helps the model cross-reference clauses with missing protections.
 *
 * Pipeline:
 *   1. Check cache → return early if hit
 *   2. Call Gemini with structured JSON schema
 *   3. Validate response with zod
 *   4. Verify quotes with verifyQuotes() (code, not model)
 *   5. Compute deterministic risk summary (code, not model)
 *   6. Cache and return result
 */

import 'server-only';
import { generateStructured } from './client';
import { ANALYZE_MAX_OUTPUT_TOKENS } from './client';
import { buildAnalyzeSystemPrompt, buildAnalyzeUserPrompt, PROMPT_VERSION } from './prompts';
import { verifyQuotes } from './verify';
import { makeCacheKey, getCached, setCached } from '@/lib/cache';
import {
  ModelAnalysisSchema,
  AnalysisResult,
  RiskLevel,
  RiskSummary,
} from '@/lib/schemas/analyze';
import { DocumentType, OutputLanguage } from '@/lib/config';
import { LegalLensError, ErrorCode } from '@/lib/errors';

// ---------------------------------------------------------------------------
// Risk summary (deterministic — code-computed, not model)
// ---------------------------------------------------------------------------

/**
 * Compute a risk summary by counting clause risk levels.
 * This is intentionally deterministic and testable without any AI.
 */
export function computeRiskSummary(riskLevels: RiskLevel[]): RiskSummary {
  const summary: RiskSummary = { high: 0, medium: 0, low: 0, info: 0, total: riskLevels.length };
  for (const level of riskLevels) {
    summary[level]++;
  }
  return summary;
}

// ---------------------------------------------------------------------------
// Gemini response schema (used to request structured output)
// ---------------------------------------------------------------------------

const ANALYZE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    clauses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' },
          quote: { type: 'string' },
          explanation: { type: 'string' },
          riskLevel: { type: 'string', enum: ['high', 'medium', 'low', 'info'] },
          riskReason: { type: 'string' },
          questionToAsk: { type: 'string' },
        },
        required: ['id', 'title', 'category', 'quote', 'explanation', 'riskLevel', 'riskReason', 'questionToAsk'],
      },
    },
    keyFacts: {
      type: 'object',
      properties: {
        obligations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              party: { type: 'string' },
              obligation: { type: 'string' },
            },
            required: ['party', 'obligation'],
          },
        },
        amounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              amount: { type: 'string' },
            },
            required: ['label', 'amount'],
          },
        },
        dates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              date: { type: 'string' },
            },
            required: ['label', 'date'],
          },
        },
      },
      required: ['obligations', 'amounts', 'dates'],
    },
    missingProtections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          whyItMatters: { type: 'string' },
          suggestedQuestion: { type: 'string' },
        },
        required: ['name', 'whyItMatters', 'suggestedQuestion'],
      },
    },
    lawyerQuestions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['clauses', 'keyFacts', 'missingProtections', 'lawyerQuestions'],
};

// ---------------------------------------------------------------------------
// Main analyze function
// ---------------------------------------------------------------------------

/**
 * Analyse a legal document using a single Gemini call.
 * Returns a fully validated AnalysisResult with quote verification and risk summary.
 */
export async function analyzeDocument(
  text: string,
  docType: DocumentType,
  language: OutputLanguage,
): Promise<AnalysisResult> {
  // 1. Cache check
  const cacheKey = makeCacheKey(text, docType, language, PROMPT_VERSION);
  const cached = getCached<AnalysisResult>(cacheKey);
  if (cached) return cached;

  // 2. Call Gemini
  const raw = await generateStructured({
    systemInstruction: buildAnalyzeSystemPrompt(),
    userPrompt: buildAnalyzeUserPrompt(text, docType, language),
    responseSchema: ANALYZE_RESPONSE_SCHEMA,
    maxOutputTokens: ANALYZE_MAX_OUTPUT_TOKENS,
  });

  // 3. Validate response shape with zod
  const parsed = ModelAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    throw new LegalLensError(
      ErrorCode.MODEL_INVALID_RESPONSE,
      'The AI returned an unexpected response format.',
      502,
    );
  }

  const modelResult = parsed.data;

  // 4. Verify quotes (code, not model)
  const quotes = modelResult.clauses.map((c) => c.quote);
  const verified = verifyQuotes(text, quotes);

  // 5. Build final clauses with quoteVerified set
  const clauses = modelResult.clauses
    .map((clause, i) => ({
      ...clause,
      quoteVerified: verified[i] ?? false,
    }))
    // Sort by risk level: high → medium → low → info
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2, info: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

  // 6. Compute deterministic risk summary
  const riskSummary = computeRiskSummary(clauses.map((c) => c.riskLevel));

  const result: AnalysisResult = {
    clauses,
    keyFacts: modelResult.keyFacts,
    missingProtections: modelResult.missingProtections,
    lawyerQuestions: modelResult.lawyerQuestions,
    riskSummary,
    docType,
    language,
  };

  // 7. Cache and return
  setCached(cacheKey, result);
  return result;
}

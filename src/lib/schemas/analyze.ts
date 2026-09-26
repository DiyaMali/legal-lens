/**
 * Zod schemas for the /api/analyze endpoint.
 *
 * These are the single source of truth for all analysis types.
 * The Gemini responseSchema is derived from these — keeping them in sync
 * prevents type drift between what the model returns and what the UI expects.
 */
import { z } from 'zod';
import { DOCUMENT_TYPES, OUTPUT_LANGUAGES } from '@/lib/config';

// ---------------------------------------------------------------------------
// Risk levels
// ---------------------------------------------------------------------------

export const RiskLevelSchema = z.enum(['high', 'medium', 'low', 'info']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

// ---------------------------------------------------------------------------
// Clause (F2)
// ---------------------------------------------------------------------------

/**
 * A single analysed clause from the document.
 * quoteVerified is set by our verification code, NEVER by the model.
 */
export const ClauseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  /** Exact, contiguous quote from the source document */
  quote: z.string().min(1),
  /** Set by verifyQuote() in src/lib/ai/verify.ts — not from the model */
  quoteVerified: z.boolean(),
  /** Optional plain translation of quote if quote is in another language */
  quoteTranslation: z.string().optional(),
  /** Plain-language explanation in the selected output language */
  explanation: z.string().min(1),
  riskLevel: RiskLevelSchema,
  riskReason: z.string().min(1),
  /** Question the user could raise with the other party or a lawyer */
  questionToAsk: z.string().min(1),
});

export type Clause = z.infer<typeof ClauseSchema>;

// ---------------------------------------------------------------------------
// Key facts (F3)
// ---------------------------------------------------------------------------

export const ObligationSchema = z.object({
  party: z.string().min(1),
  obligation: z.string().min(1),
});

export const MoneyAmountSchema = z.object({
  label: z.string().min(1),
  amount: z.string().min(1),
});

export const DateItemSchema = z.object({
  label: z.string().min(1),
  date: z.string().min(1),
});

export const KeyFactsSchema = z.object({
  obligations: z.array(ObligationSchema),
  amounts: z.array(MoneyAmountSchema),
  dates: z.array(DateItemSchema),
});

export type KeyFacts = z.infer<typeof KeyFactsSchema>;
export type Obligation = z.infer<typeof ObligationSchema>;
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
export type DateItem = z.infer<typeof DateItemSchema>;

// ---------------------------------------------------------------------------
// Missing protections (F4)
// ---------------------------------------------------------------------------

export const MissingProtectionSchema = z.object({
  name: z.string().min(1),
  whyItMatters: z.string().min(1),
  suggestedQuestion: z.string().min(1),
});

export type MissingProtection = z.infer<typeof MissingProtectionSchema>;

// ---------------------------------------------------------------------------
// Risk summary (computed deterministically in code, not by the model)
// ---------------------------------------------------------------------------

export const RiskSummarySchema = z.object({
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
  info: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type RiskSummary = z.infer<typeof RiskSummarySchema>;

// ---------------------------------------------------------------------------
// Full analysis response (returned by /api/analyze)
// ---------------------------------------------------------------------------

export const AnalysisResultSchema = z.object({
  clauses: z.array(ClauseSchema),
  keyFacts: KeyFactsSchema,
  missingProtections: z.array(MissingProtectionSchema),
  /** Questions to ask a lawyer — extracted from clauses, not a separate call */
  lawyerQuestions: z.array(z.string().min(1)),
  /** Computed in code from clause risk levels */
  riskSummary: RiskSummarySchema,
  /** Document type that was analysed */
  docType: z.enum(DOCUMENT_TYPES),
  /** Output language used */
  language: z.enum(OUTPUT_LANGUAGES),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ---------------------------------------------------------------------------
// Analyze API request schema
// ---------------------------------------------------------------------------

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(80_000),
  docType: z.enum(DOCUMENT_TYPES),
  language: z.enum(OUTPUT_LANGUAGES),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// ---------------------------------------------------------------------------
// Model output schema (what Gemini is asked to return — no quoteVerified)
// ---------------------------------------------------------------------------

/** Clause shape as returned by the model (before our verification step) */
export const ModelClauseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  quote: z.string().min(1),
  explanation: z.string().min(1),
  riskLevel: RiskLevelSchema,
  riskReason: z.string().min(1),
  questionToAsk: z.string().min(1),
});

export const ModelAnalysisSchema = z.object({
  clauses: z.array(ModelClauseSchema),
  keyFacts: KeyFactsSchema,
  missingProtections: z.array(MissingProtectionSchema),
  lawyerQuestions: z.array(z.string()),
});

export type ModelAnalysis = z.infer<typeof ModelAnalysisSchema>;

/**
 * Zod schemas for the /api/compare endpoint.
 */
import { z } from 'zod';
import { DOCUMENT_TYPES, OUTPUT_LANGUAGES } from '@/lib/config';

// ---------------------------------------------------------------------------
// Comparison item
// ---------------------------------------------------------------------------

export const RiskChangeSchema = z.enum(['higher_in_a', 'higher_in_b', 'similar', 'unclear']);
export type RiskChange = z.infer<typeof RiskChangeSchema>;

export const ComparisonItemSchema = z.object({
  topic: z.string().min(1),
  /** How the topic appears in Document A (null if absent) */
  inDocA: z.string().nullable(),
  /** How the topic appears in Document B (null if absent) */
  inDocB: z.string().nullable(),
  /** Neutral description of the difference */
  difference: z.string().min(1),
  riskChange: RiskChangeSchema,
});

export type ComparisonItem = z.infer<typeof ComparisonItemSchema>;

// ---------------------------------------------------------------------------
// Compare API request
// ---------------------------------------------------------------------------

export const CompareRequestSchema = z.object({
  textA: z.string().min(1).max(80_000),
  textB: z.string().min(1).max(80_000),
  docType: z.enum(DOCUMENT_TYPES),
  language: z.enum(OUTPUT_LANGUAGES),
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

// ---------------------------------------------------------------------------
// Compare API response
// ---------------------------------------------------------------------------

export const CompareResponseSchema = z.object({
  summary: z.string().min(1),
  items: z.array(ComparisonItemSchema),
  docType: z.enum(DOCUMENT_TYPES),
  language: z.enum(OUTPUT_LANGUAGES),
});

export type CompareResponse = z.infer<typeof CompareResponseSchema>;

// ---------------------------------------------------------------------------
// Model output schema
// ---------------------------------------------------------------------------

export const ModelCompareSchema = z.object({
  summary: z.string().min(1),
  items: z.array(ComparisonItemSchema),
});

export type ModelCompare = z.infer<typeof ModelCompareSchema>;

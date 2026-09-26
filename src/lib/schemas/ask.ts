/**
 * Zod schemas for the /api/ask (Q&A) endpoint.
 */
import { z } from 'zod';
import { OUTPUT_LANGUAGES, MAX_QUESTION_CHARS, MAX_HISTORY_CHARS } from '@/lib/config';

// ---------------------------------------------------------------------------
// Conversation history
// ---------------------------------------------------------------------------

export const HistoryTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(MAX_HISTORY_CHARS),
});

export type HistoryTurn = z.infer<typeof HistoryTurnSchema>;

// ---------------------------------------------------------------------------
// Citation (a verified quote from the document supporting an answer)
// ---------------------------------------------------------------------------

export const CitationSchema = z.object({
  quote: z.string().min(1),
  /** Set by verifyQuote() — never by the model */
  verified: z.boolean(),
});

export type Citation = z.infer<typeof CitationSchema>;

// ---------------------------------------------------------------------------
// Q&A API request
// ---------------------------------------------------------------------------

export const AskRequestSchema = z.object({
  text: z.string().min(1).max(80_000),
  question: z.string().min(1).max(MAX_QUESTION_CHARS),
  language: z.enum(OUTPUT_LANGUAGES),
  /** Last 2 turns of conversation for context */
  history: z.array(HistoryTurnSchema).max(4).optional(),
});

export type AskRequest = z.infer<typeof AskRequestSchema>;

// ---------------------------------------------------------------------------
// Q&A API response
// ---------------------------------------------------------------------------

export const AskResponseSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(CitationSchema),
  /** True when the document does not contain enough information to answer */
  notInDocument: z.boolean(),
});

export type AskResponse = z.infer<typeof AskResponseSchema>;

// ---------------------------------------------------------------------------
// Model output schema (before our verification step)
// ---------------------------------------------------------------------------

export const ModelAskSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(z.object({ quote: z.string() })),
  notInDocument: z.boolean(),
});

export type ModelAsk = z.infer<typeof ModelAskSchema>;

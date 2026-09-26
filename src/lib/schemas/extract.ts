/**
 * Zod schemas for the /api/extract endpoint.
 * These schemas are the single source of truth for extract request/response types.
 */
import { z } from 'zod';

/** Response from the extract API */
export const ExtractResponseSchema = z.object({
  text: z.string().min(1),
  /** Character count of the extracted text */
  charCount: z.number().int().nonnegative(),
  /** Number of pages (only meaningful for PDFs) */
  pageCount: z.number().int().nonnegative().optional(),
});

export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

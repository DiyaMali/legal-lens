import { z } from 'zod';
import { AnalysisResultSchema } from './analyze';

export const UserProfileSchema = z.object({
  name: z.string().default('Legal Lens User'),
  role: z.enum(['Tenant', 'Employee', 'Freelancer', 'Small Business Owner', 'Student', 'Other']).default('Tenant'),
  notes: z.string().default(''),
  jurisdiction: z.string().default('India'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const HistoryItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  title: z.string().default('Untitled Contract'),
  documentType: z.string(),
  language: z.enum(['en', 'hi', 'mr']),
  result: AnalysisResultSchema,
  riskSummary: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
});

export type HistoryItem = z.infer<typeof HistoryItemSchema>;

export const HistoryListSchema = z.array(HistoryItemSchema);

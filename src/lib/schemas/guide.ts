import { z } from 'zod';
import { OUTPUT_LANGUAGES } from '@/lib/config';

export const GUIDE_ALLOWED_ROUTES = ['/', '/analyze', '/compare', '/dashboard'] as const;
export type GuideAllowedRoute = (typeof GUIDE_ALLOWED_ROUTES)[number];

export const GuideActionSchema = z.object({
  type: z.literal('NAVIGATE'),
  route: z.enum(GUIDE_ALLOWED_ROUTES),
  label: z.string().min(1),
});

export const GuideRequestSchema = z.object({
  message: z.string().min(1).max(500),
  language: z.enum(OUTPUT_LANGUAGES).default('en'),
});

export type GuideRequest = z.infer<typeof GuideRequestSchema>;

export const GuideResponseSchema = z.object({
  reply: z.string().min(1),
  action: GuideActionSchema.optional(),
  suggestedChips: z.array(z.string()).max(4).optional(),
});

export type GuideResponse = z.infer<typeof GuideResponseSchema>;

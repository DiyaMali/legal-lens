import { describe, it, expect } from 'vitest';
import { GuideRequestSchema, GuideResponseSchema, GUIDE_ALLOWED_ROUTES } from '@/lib/schemas/guide';
import { handleGuideQuery } from '@/lib/guide/prompts';

describe('Guide Chatbot Schemas & Route Handling', () => {
  it('validates a proper GuideRequest', () => {
    const valid = {
      message: 'How do I analyze a rental agreement?',
      language: 'en',
    };
    const parsed = GuideRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects messages longer than 500 characters', () => {
    const invalid = {
      message: 'A'.repeat(501),
      language: 'en',
    };
    const parsed = GuideRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects empty messages', () => {
    const invalid = {
      message: '',
      language: 'en',
    };
    const parsed = GuideRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates GuideResponse with an allowed action route', () => {
    const validResponse = {
      reply: 'You can upload documents on the Analyze page.',
      action: {
        type: 'NAVIGATE' as const,
        route: '/analyze' as const,
        label: 'Go to Analyze',
      },
      suggestedChips: ['Is it safe?'],
    };
    const parsed = GuideResponseSchema.safeParse(validResponse);
    expect(parsed.success).toBe(true);
  });

  it('rejects GuideResponse with an unapproved action route', () => {
    const invalidResponse = {
      reply: 'Click here to buy stuff',
      action: {
        type: 'NAVIGATE',
        route: '/checkout',
        label: 'Checkout',
      },
    };
    const parsed = GuideResponseSchema.safeParse(invalidResponse);
    expect(parsed.success).toBe(false);
  });

  it('uses static knowledge fast-path without AI call for known topics', async () => {
    const res = await handleGuideQuery({
      message: 'How do I upload or analyze a PDF file?',
      language: 'en',
    });

    expect(res.reply).toContain('Analyze Document');
    expect(res.action?.route).toBe('/analyze');
    expect(GUIDE_ALLOWED_ROUTES).toContain(res.action?.route);
  });

  it('calls Gemini when no static match is found', async () => {
    const clientModule = await import('@/lib/ai/client');
    const { vi } = await import('vitest');
    vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
      reply: 'Legal Lens is built to explain contracts.',
      action: {
        type: 'NAVIGATE',
        route: '/compare',
        label: 'Compare contracts',
      },
      suggestedChips: ['Try comparing'],
    });

    const res = await handleGuideQuery({
      message: 'Can you tell me about the philosophical purpose of legal drafting?',
      language: 'en',
    });

    expect(res.reply).toBe('Legal Lens is built to explain contracts.');
    expect(res.action?.route).toBe('/compare');
  });
});

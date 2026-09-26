import { GUIDE_STATIC_KNOWLEDGE, GUIDE_DEFAULT_CHIPS } from './knowledge';
import { GuideRequest, GuideResponse, GUIDE_ALLOWED_ROUTES } from '@/lib/schemas/guide';
import { generateStructured } from '@/lib/ai/client';

export async function handleGuideQuery(req: GuideRequest): Promise<GuideResponse> {
  const lower = req.message.toLowerCase().trim();

  // Fast static matching first (0ms latency, zero API cost)
  for (const entry of GUIDE_STATIC_KNOWLEDGE) {
    if (entry.topics.some((topic) => lower.includes(topic))) {
      return {
        reply: entry.reply,
        action: entry.route
          ? {
              type: 'NAVIGATE',
              route: entry.route,
              label: entry.routeLabel || `Go to ${entry.route}`,
            }
          : undefined,
        suggestedChips: entry.chips || GUIDE_DEFAULT_CHIPS.slice(0, 3),
      };
    }
  }

  // Fallback to Gemini with strict app-guide system prompt
  const systemInstruction =
    'You are "Legal Lens Guide", the in-app navigational and help assistant for the Legal Lens web application. ' +
    'Your ONLY role is to explain what Legal Lens is, how to use its tools (Analyze, Compare, Dashboard), and how features like multilingual support and read-aloud work. ' +
    'CRITICAL RULES:\n' +
    '1. NEVER analyze contracts or give legal advice in this chatbot. If the user asks for legal analysis, politely direct them to the Analyze Document tool (/analyze).\n' +
    '2. If you suggest navigating to a page, action.route MUST be one of ["/", "/analyze", "/compare", "/dashboard"].\n' +
    '3. Keep replies concise, helpful, and friendly (2-3 sentences max).';

  const userPrompt = `User question about using Legal Lens: "${req.message}"`;

  const raw = await generateStructured({
    systemInstruction,
    userPrompt,
    responseSchema: {
      type: 'OBJECT',
      properties: {
        reply: { type: 'STRING' },
        action: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', enum: ['NAVIGATE'] },
            route: { type: 'STRING', enum: GUIDE_ALLOWED_ROUTES },
            label: { type: 'STRING' },
          },
          required: ['type', 'route', 'label'],
        },
        suggestedChips: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
      required: ['reply'],
    },
    maxOutputTokens: 500,
  });

  const parsed = raw as Partial<GuideResponse>;
  return {
    reply: parsed.reply || 'I am here to help you navigate Legal Lens. Try asking how to analyze a document or compare contracts!',
    action:
      parsed.action && GUIDE_ALLOWED_ROUTES.includes(parsed.action.route)
        ? parsed.action
        : undefined,
    suggestedChips: parsed.suggestedChips?.slice(0, 3) || GUIDE_DEFAULT_CHIPS.slice(0, 3),
  };
}

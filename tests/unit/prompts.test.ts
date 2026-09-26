import { describe, it, expect } from 'vitest';
import {
  PROMPT_VERSION,
  buildAnalyzeSystemPrompt,
  buildAnalyzeUserPrompt,
  buildAskSystemPrompt,
  buildAskUserPrompt,
  buildCompareSystemPrompt,
  buildCompareUserPrompt,
} from '@/lib/ai/prompts';

describe('prompts module', () => {
  it('defines a prompt version string', () => {
    expect(PROMPT_VERSION).toBeTruthy();
    expect(typeof PROMPT_VERSION).toBe('string');
  });

  describe('buildAnalyzeSystemPrompt', () => {
    it('contains crucial boundary rules and security warnings', () => {
      const prompt = buildAnalyzeSystemPrompt();
      expect(prompt.toLowerCase()).toContain('not legal advice');
      expect(prompt).toContain('NEVER tell the user to sign');
      expect(prompt).toContain('UNTRUSTED USER-PROVIDED CONTENT');
      expect(prompt).toContain('QUOTE REQUIREMENTS');
    });
  });

  describe('buildAnalyzeUserPrompt', () => {
    it('includes document text, docType checklist, delimiters, and target language', () => {
      const doc = 'This Agreement is entered into on Jan 1.';
      const prompt = buildAnalyzeUserPrompt(doc, 'rental', 'hi');
      expect(prompt).toContain('<<<DOCUMENT_START>>>');
      expect(prompt).toContain(doc);
      expect(prompt).toContain('<<<DOCUMENT_END>>>');
      expect(prompt).toContain('Hindi');
      expect(prompt).toContain('MISSING PROTECTIONS CHECKLIST');
      expect(prompt).toContain('Rent amount and escalation');
    });
  });

  describe('buildAskSystemPrompt', () => {
    it('contains grounding rules and boundary rules', () => {
      const prompt = buildAskSystemPrompt();
      expect(prompt).toContain('GROUNDING RULES');
      expect(prompt).toContain('Answer ONLY from the provided document text');
      expect(prompt).toContain('notInDocument');
    });
  });

  describe('buildAskUserPrompt', () => {
    it('includes question, document text, and optional history', () => {
      const doc = 'Notice period is 30 days.';
      const promptNoHistory = buildAskUserPrompt(doc, 'What is the notice period?', 'en');
      expect(promptNoHistory).toContain('What is the notice period?');
      expect(promptNoHistory).toContain('<<<DOCUMENT_START>>>');
      expect(promptNoHistory).toContain(doc);
      expect(promptNoHistory).not.toContain('CONVERSATION HISTORY');

      const promptWithHistory = buildAskUserPrompt(doc, 'What about early exit?', 'en', [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ]);
      expect(promptWithHistory).toContain('CONVERSATION HISTORY');
      expect(promptWithHistory).toContain('User: Hi');
      expect(promptWithHistory).toContain('Assistant: Hello');
    });
  });

  describe('buildCompareSystemPrompt', () => {
    it('contains comparison rules and neutral requirements', () => {
      const prompt = buildCompareSystemPrompt();
      expect(prompt).toContain('COMPARISON RULES');
      expect(prompt).toContain('Compare the two documents NEUTRALLY');
    });
  });

  describe('buildCompareUserPrompt', () => {
    it('includes both documents and diff instructions', () => {
      const docA = 'Doc A terms';
      const docB = 'Doc B terms';
      const prompt = buildCompareUserPrompt(docA, docB, 'employment', 'mr');
      expect(prompt).toContain('<<<DOCUMENT_A_START>>>');
      expect(prompt).toContain(docA);
      expect(prompt).toContain('<<<DOCUMENT_B_START>>>');
      expect(prompt).toContain(docB);
      expect(prompt).toContain('Marathi');
    });
  });
});

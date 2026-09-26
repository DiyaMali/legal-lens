import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDocument } from '@/lib/ai/analyze';
import { askQuestion } from '@/lib/ai/ask';
import { compareDocuments } from '@/lib/ai/compare';
import * as clientModule from '@/lib/ai/client';
import { LegalLensError, ErrorCode } from '@/lib/errors';
import { clearCache } from '@/lib/cache';

describe('AI operations', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  describe('analyzeDocument', () => {
    it('analyzes document, verifies quotes, computes risk summary, and caches result', async () => {
      const docText = 'The tenant must pay 50000 INR on 1st of every month. Security deposit is non-refundable.';

      const mockModelOutput = {
        clauses: [
          {
            id: 'c1',
            title: 'Deposit clause',
            category: 'Financial',
            quote: 'Security deposit is non-refundable.',
            explanation: 'The deposit will not be returned.',
            riskLevel: 'high',
            riskReason: 'Loss of deposit money.',
            questionToAsk: 'Why is the deposit non-refundable?',
          },
          {
            id: 'c2',
            title: 'Rent payment',
            category: 'Financial',
            quote: 'The tenant must pay 50000 INR',
            explanation: 'Rent amount.',
            riskLevel: 'low',
            riskReason: 'Standard obligation.',
            questionToAsk: 'Can payment be online?',
          },
        ],
        keyFacts: {
          obligations: [{ party: 'Tenant', obligation: 'Pay rent' }],
          amounts: [{ label: 'Rent', amount: '50000 INR' }],
          dates: [{ label: 'Due Date', date: '1st of every month' }],
        },
        missingProtections: [
          {
            name: 'Notice period',
            whyItMatters: 'Notice required to vacate',
            suggestedQuestion: 'What notice is required?',
          },
        ],
        lawyerQuestions: ['Is this non-refundable deposit clause valid?'],
      };

      const spy = vi
        .spyOn(clientModule, 'generateStructured')
        .mockResolvedValue(mockModelOutput);

      const result = await analyzeDocument(docText, 'rental', 'en');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result.clauses.length).toBe(2);
      expect(result.clauses[0]?.id).toBe('c1');
      expect(result.clauses[0]?.quoteVerified).toBe(true);
      expect(result.riskSummary.high).toBe(1);
      expect(result.riskSummary.low).toBe(1);
      expect(result.riskSummary.total).toBe(2);

      // Call again with identical params to verify cache hit
      const cachedResult = await analyzeDocument(docText, 'rental', 'en');
      expect(spy).toHaveBeenCalledTimes(1); // No new AI call
      expect(cachedResult).toEqual(result);
    });

    it('throws MODEL_INVALID_RESPONSE if model returns invalid schema', async () => {
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        invalid: 'shape',
      });

      await expect(
        analyzeDocument('some text', 'rental', 'en'),
      ).rejects.toThrow(
        expect.objectContaining({ code: ErrorCode.MODEL_INVALID_RESPONSE }),
      );
    });
  });

  describe('askQuestion', () => {
    it('answers question and verifies citations', async () => {
      const docText = 'Notice period for termination is sixty days in writing.';
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        answer: 'The notice period is 60 days.',
        citations: [{ quote: 'Notice period for termination is sixty days' }],
        notInDocument: false,
      });

      const res = await askQuestion(docText, 'What is the notice period?', 'en');
      expect(res.answer).toBe('The notice period is 60 days.');
      expect(res.citations.length).toBe(1);
      expect(res.citations[0]?.verified).toBe(true);
      expect(res.notInDocument).toBe(false);
    });

    it('handles notInDocument responses', async () => {
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        answer: 'This document does not specify pet policies.',
        citations: [],
        notInDocument: true,
      });

      const res = await askQuestion('Rent agreement', 'Are pets allowed?', 'en');
      expect(res.notInDocument).toBe(true);
      expect(res.citations.length).toBe(0);
    });

    it('throws MODEL_INVALID_RESPONSE on schema failure', async () => {
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({ bad: true });
      await expect(askQuestion('Doc', 'Q', 'en')).rejects.toThrow(
        expect.objectContaining({ code: ErrorCode.MODEL_INVALID_RESPONSE }),
      );
    });
  });

  describe('compareDocuments', () => {
    it('compares two documents and returns structured difference list', async () => {
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        summary: 'Doc A has stricter terms than Doc B.',
        items: [
          {
            topic: 'Notice Period',
            inDocA: '90 days',
            inDocB: '30 days',
            difference: 'Doc A requires 90 days vs Doc B 30 days.',
            riskChange: 'higher_in_a',
          },
        ],
      });

      const res = await compareDocuments('Doc A text', 'Doc B text', 'employment', 'en');
      expect(res.summary).toBe('Doc A has stricter terms than Doc B.');
      expect(res.items.length).toBe(1);
      expect(res.items[0]?.riskChange).toBe('higher_in_a');
      expect(res.docType).toBe('employment');
    });

    it('throws MODEL_INVALID_RESPONSE on invalid schema', async () => {
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({ bad: true });
      await expect(compareDocuments('A', 'B', 'rental', 'en')).rejects.toThrow(
        expect.objectContaining({ code: ErrorCode.MODEL_INVALID_RESPONSE }),
      );
    });
  });

  describe('translateLegalText', () => {
    it('translates legal text using Gemini', async () => {
      const { translateLegalText } = await import('@/lib/ai/translate');
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        translatedText: 'सुरक्षा ठेव ₹५०,००० आहे.',
        sourceLanguage: 'en',
        targetLanguage: 'mr',
      });

      const res = await translateLegalText({
        text: 'The security deposit is Rs 50,000.',
        targetLanguage: 'mr',
        sourceLanguage: 'en',
      });

      expect(res.translatedText).toBe('सुरक्षा ठेव ₹५०,००० आहे.');
      expect(res.targetLanguage).toBe('mr');
    });
  });

  describe('handleGuideQuery AI fallback', () => {
    it('calls Gemini when static topic is not matched', async () => {
      const { handleGuideQuery } = await import('@/lib/guide/prompts');
      vi.spyOn(clientModule, 'generateStructured').mockResolvedValue({
        reply: 'You can explore features using the top navbar.',
        action: {
          type: 'NAVIGATE',
          route: '/dashboard',
          label: 'Go to Dashboard',
        },
        suggestedChips: ['How to start?'],
      });

      const res = await handleGuideQuery({
        message: 'Where can I see an overview of my past documents?',
        language: 'en',
      });

      expect(res.reply).toBeDefined();
    });
  });
});

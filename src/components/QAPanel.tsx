'use client';

/**
 * QAPanel — Grounded Q&A over the document (F5).
 *
 * Features:
 * - Question input with submit
 * - Answer with verified citations
 * - Read aloud support for answers
 * - "Not in document" state with appropriate message
 * - Last 2 turns of history sent as context
 * - Loading skeleton while waiting
 */

import { useState, useRef, useId } from 'react';
import { AskResponse, HistoryTurn } from '@/lib/schemas/ask';
import { OutputLanguage } from '@/lib/config';
import { USER_ERROR_MESSAGES } from '@/lib/errors';
import { Disclaimer } from './Disclaimer';
import { SpeakButton } from './SpeakButton';

interface QAPanelProps {
  documentText: string;
  language: OutputLanguage;
}

interface QATurn {
  question: string;
  answer: AskResponse;
}

export function QAPanel({ documentText, language }: QAPanelProps) {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<QATurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputId = useId();
  const errorId = useId();
  const statusId = useId();
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setError(null);
    setIsLoading(true);

    // Build history from last 2 turns
    const history: HistoryTurn[] = turns
      .slice(-2)
      .flatMap((t) => [
        { role: 'user' as const, content: t.question },
        { role: 'assistant' as const, content: t.answer.answer },
      ]);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText, question: q, language, history }),
      });

      const data = (await response.json()) as AskResponse & {
        error?: { code: string; message: string };
      };

      if (!response.ok || data.error) {
        const code = data.error?.code ?? 'INTERNAL_ERROR';
        setError(
          USER_ERROR_MESSAGES[code as keyof typeof USER_ERROR_MESSAGES] ??
            'Something went wrong.',
        );
        return;
      }

      setTurns((prev) => [...prev, { question: q, answer: data }]);
      setQuestion('');

      // Scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setError('Failed to send question. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-label="Question and answer about the document">
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Ask a Question
      </h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Ask anything about the document. Answers are grounded in the document text only — the AI
        will tell you if the answer is not in the document.
      </p>

      {/* Status for screen readers */}
      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {isLoading && 'Getting answer, please wait.'}
        {!isLoading && turns.length > 0 && 'Answer ready.'}
      </div>

      {/* Q&A history */}
      {turns.length > 0 && (
        <div className="mb-4 space-y-4" aria-label="Q&A conversation">
          {turns.map((turn, i) => (
            <div key={i} className="space-y-2">
              {/* Question */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm text-white shadow-sm dark:bg-brand-500">
                  {turn.question}
                </div>
              </div>

              {/* Answer */}
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                      Legal Lens Answer
                    </span>
                    <SpeakButton
                      text={turn.answer.answer}
                      language={language}
                      label="Read"
                      size="sm"
                    />
                  </div>

                  {turn.answer.notInDocument ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                        ℹ The document does not appear to address this question.
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {turn.answer.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {turn.answer.answer}
                    </p>
                  )}

                  {/* Citations */}
                  {turn.answer.citations.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        From the document:
                      </p>
                      {turn.answer.citations.map((c, j) => (
                        <blockquote
                          key={j}
                          className={`border-l-2 pl-2 text-xs italic ${
                            c.verified
                              ? 'border-brand-300 text-slate-600 dark:border-brand-700 dark:text-slate-400'
                              : 'border-amber-300 text-slate-500 dark:border-amber-700 dark:text-slate-400'
                          }`}
                        >
                          &ldquo;{c.quote.slice(0, 200)}{c.quote.length > 200 ? '…' : ''}&rdquo;
                          {!c.verified && (
                            <span className="mt-0.5 block not-italic text-amber-500">
                              ⚠ Could not verify in source
                            </span>
                          )}
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mb-4" aria-hidden="true">
          <div className="mb-2 flex justify-end">
            <div className="skeleton h-10 w-48 rounded-xl" />
          </div>
          <div className="skeleton h-24 w-3/4 rounded-xl" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          id={errorId}
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {turns.length === 0 && !isLoading && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl" aria-hidden="true">
            💬
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ask about specific clauses, deadlines, obligations, or anything else in the document.
          </p>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} aria-label="Ask a question">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Your question
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How much notice do I need to give to vacate?"
            maxLength={1000}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            aria-describedby={error ? errorId : undefined}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Ask
          </button>
        </div>
      </form>

      <div className="mt-4">
        <Disclaimer variant="inline" />
      </div>
    </section>
  );
}

'use client';

/**
 * ComparePanel — two-document comparison UI (F6).
 *
 * Allows the user to input a second document (Document B) to compare
 * against the primary document (Document A, already analysed).
 */

import { useState, useId } from 'react';
import { CompareResponse } from '@/lib/schemas/compare';
import { DocumentType, OutputLanguage, DOCUMENT_TYPE_LABELS } from '@/lib/config';
import { USER_ERROR_MESSAGES } from '@/lib/errors';
import { Disclaimer } from './Disclaimer';
import { SpeakButton } from './SpeakButton';

interface ComparePanelProps {
  documentAText: string;
  docType: DocumentType;
  language: OutputLanguage;
}

const RISK_CHANGE_LABELS = {
  higher_in_a: {
    label: 'Higher risk in Doc A',
    className: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  },
  higher_in_b: {
    label: 'Higher risk in Doc B',
    className: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  },
  similar: {
    label: 'Similar risk',
    className: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  },
  unclear: {
    label: 'Unclear',
    className: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
};

export function ComparePanel({ documentAText, docType, language }: ComparePanelProps) {
  const [documentBText, setDocumentBText] = useState('');
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textAreaId = useId();
  const errorId = useId();
  const statusId = useId();

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = documentBText.trim();
    if (!trimmed) {
      setError('Please enter the text for Document B.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textA: documentAText, textB: trimmed, docType, language }),
      });

      const data = (await response.json()) as CompareResponse & {
        error?: { code: string; message: string };
      };

      if (!response.ok || data.error) {
        const code = data.error?.code ?? 'INTERNAL_ERROR';
        setError(
          USER_ERROR_MESSAGES[code as keyof typeof USER_ERROR_MESSAGES] ??
            'Comparison failed.',
        );
        return;
      }

      setResult(data);
    } catch {
      setError('Comparison failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-label="Document comparison">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Compare Documents
        </h2>
        {result && (
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setDocumentBText('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400"
          >
            <span>← Edit Document B</span>
          </button>
        )}
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Compare <strong>Document A</strong> (the one you analysed) with a second document (
        <strong>Document B</strong>). The AI will highlight key differences and risk changes
        neutrally — no recommendations on which to choose.
      </p>

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {isLoading && 'Comparing documents, please wait.'}
        {result && 'Comparison complete.'}
      </div>

      {!result && (
        <form onSubmit={handleCompare} aria-label="Document B input">
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Document A (already loaded)
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {documentAText.slice(0, 100)}…
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor={textAreaId}
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Document B — paste text to compare
            </label>
            <textarea
              id={textAreaId}
              value={documentBText}
              onChange={(e) => setDocumentBText(e.target.value)}
              placeholder="Paste the second document's text here…"
              rows={8}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          {error && (
            <div
              role="alert"
              id={errorId}
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !documentBText.trim()}
            className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {isLoading ? 'Comparing…' : 'Compare Documents'}
          </button>
        </form>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3 mt-4" aria-hidden="true">
          <div className="skeleton h-8 w-full rounded-lg" />
          <div className="skeleton h-24 w-full rounded-lg" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-200">
                Overall Summary
              </h3>
              <SpeakButton
                text={`Overall Comparison Summary. ${result.summary}`}
                language={language}
                label="Read Summary"
                size="sm"
                allowLanguageSelect={true}
              />
            </div>
            <p className="text-sm text-brand-700 dark:text-brand-300">{result.summary}</p>
          </div>

          <div className="mb-4 grid grid-cols-3 rounded-lg border border-slate-200 bg-white text-center text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div className="border-r border-slate-200 p-3 dark:border-slate-800">
              Document A<br />
              <span className="text-slate-400 font-normal">
                {DOCUMENT_TYPE_LABELS[result.docType]}
              </span>
            </div>
            <div className="border-r border-slate-200 p-3 dark:border-slate-800">Topic</div>
            <div className="p-3">Document B</div>
          </div>

          <div className="space-y-3">
            {result.items.map((item, i) => {
              const riskConfig = RISK_CHANGE_LABELS[item.riskChange];
              const itemTextToSpeak = `${item.topic}. In Document A: ${item.inDocA || 'Not mentioned'}. In Document B: ${item.inDocB || 'Not mentioned'}. Difference: ${item.difference}.`;

              return (
                <article
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {item.topic}
                    </h4>
                    <div className="flex items-center gap-2">
                      <SpeakButton
                        text={itemTextToSpeak}
                        language={language}
                        label="Read"
                        size="sm"
                        allowLanguageSelect={true}
                      />
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${riskConfig.className}`}
                      >
                        {riskConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="mb-2 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                      <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">
                        Document A
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {item.inDocA ?? 'Not mentioned'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                      <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">
                        Document B
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {item.inDocB ?? 'Not mentioned'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Difference:{' '}
                    </span>
                    {item.difference}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setResult(null);
                setDocumentBText('');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400"
            >
              <span>← Compare a different document</span>
            </button>
          </div>

          <div className="mt-4">
            <Disclaimer variant="banner" />
          </div>
        </div>
      )}
    </section>
  );
}

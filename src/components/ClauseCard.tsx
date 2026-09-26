'use client';

/**
 * ClauseCard — displays a single analysed clause.
 *
 * Features:
 * - Risk badge (text + icon + color)
 * - Plain-language explanation
 * - Exact quote with verification status & optional translation
 * - Read-aloud voice support
 * - "Question to ask" section
 * - Click/Enter highlights the quote in the source text panel
 */

import { Clause } from '@/lib/schemas/analyze';
import { RiskBadge } from './RiskBadge';
import { SpeakButton } from './SpeakButton';

interface ClauseCardProps {
  clause: Clause;
  isSelected: boolean;
  onSelect: (clauseId: string) => void;
}

export function ClauseCard({ clause, isSelected, onSelect }: ClauseCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(clause.id);
    }
  };

  const textToRead = `${clause.title}. Risk level: ${clause.riskLevel}. Explanation: ${clause.explanation}. Reason: ${clause.riskReason}. Question to ask: ${clause.questionToAsk}`;

  return (
    <div
      id={`clause-card-${clause.id}`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${clause.title} — ${clause.riskLevel} risk. Click to highlight in document.`}
      onClick={() => onSelect(clause.id)}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-brand-400 bg-brand-50 shadow-md dark:border-brand-600 dark:bg-brand-950/60'
          : 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700'
      }`}
    >
      {/* Header: title + risk badge + speak button */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {clause.title}
        </h3>
        <div className="flex items-center gap-2">
          <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
            <SpeakButton text={textToRead} label="Read" size="sm" />
          </span>
          <RiskBadge level={clause.riskLevel} />
        </div>
      </div>

      {/* Category */}
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {clause.category}
      </p>

      {/* Explanation */}
      <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {clause.explanation}
      </p>

      {/* Risk reason */}
      <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <span className="font-medium text-slate-900 dark:text-white">Why this matters: </span>
        {clause.riskReason}
      </p>

      {/* Quote with verification & optional translation */}
      <blockquote
        className={`mb-3 border-l-2 pl-3 text-xs italic ${
          clause.quoteVerified
            ? 'border-brand-300 text-slate-600 dark:border-brand-700 dark:text-slate-400'
            : 'border-amber-300 text-slate-500 dark:border-amber-700 dark:text-slate-400'
        }`}
      >
        &ldquo;{clause.quote.slice(0, 200)}
        {clause.quote.length > 200 ? '…' : ''}&rdquo;
        {clause.quoteTranslation && (
          <span className="mt-1 block text-xs not-italic text-slate-500 dark:text-slate-400">
            <strong>Translation: </strong> {clause.quoteTranslation}
          </span>
        )}
        {!clause.quoteVerified && (
          <span
            role="alert"
            className="mt-1 block text-xs font-medium not-italic text-amber-600 dark:text-amber-400"
          >
            ⚠ Could not verify this quote in the source document
          </span>
        )}
      </blockquote>

      {/* Question to ask */}
      <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 dark:border-brand-900 dark:bg-brand-950/40">
        <p className="text-xs text-brand-700 dark:text-brand-300">
          <span className="font-semibold">Ask: </span>
          {clause.questionToAsk}
        </p>
      </div>
    </div>
  );
}

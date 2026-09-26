'use client';

/**
 * KeyFacts panel — displays obligations, money amounts, and dates (F3).
 */

import { KeyFacts as KeyFactsType } from '@/lib/schemas/analyze';

interface KeyFactsProps {
  keyFacts: KeyFactsType;
}

export function KeyFacts({ keyFacts }: KeyFactsProps) {
  const hasContent =
    keyFacts.obligations.length > 0 ||
    keyFacts.amounts.length > 0 ||
    keyFacts.dates.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold text-slate-700">Key Facts</h2>
        <p className="text-sm text-slate-500">No key facts were identified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-base font-semibold text-slate-800">Key Facts</h2>

      {keyFacts.obligations.length > 0 && (
        <section aria-label="Obligations" className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Obligations
          </h3>
          <ul className="space-y-1.5">
            {keyFacts.obligations.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-brand-500">•</span>
                <span>
                  <span className="font-medium">{o.party}:</span> {o.obligation}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {keyFacts.amounts.length > 0 && (
        <section aria-label="Money amounts" className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            💰 Money Amounts
          </h3>
          <ul className="space-y-1.5">
            {keyFacts.amounts.map((a, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{a.label}</span>
                <span className="font-semibold text-slate-800">{a.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {keyFacts.dates.length > 0 && (
        <section aria-label="Key dates">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            📅 Key Dates &amp; Deadlines
          </h3>
          <ul className="space-y-1.5">
            {keyFacts.dates.map((d, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{d.label}</span>
                <span className="font-semibold text-slate-800">{d.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

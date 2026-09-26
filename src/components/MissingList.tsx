'use client';

/**
 * MissingList — shows missing protections for the document type (F4).
 * Phrased as "This document does not appear to mention…" — never as legal conclusions.
 */

import { MissingProtection } from '@/lib/schemas/analyze';

interface MissingListProps {
  items: MissingProtection[];
}

export function MissingList({ items }: MissingListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-green-800">
          <span aria-hidden="true">✓</span> No Missing Protections Identified
        </h2>
        <p className="text-sm text-green-700">
          All common protections for this document type appear to be present. Worth confirming
          the details with a lawyer.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-4">
      <h2 className="mb-1 text-base font-semibold text-slate-800">
        <span aria-hidden="true">⚠ </span>Missing Protections ({items.length})
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        These common protections do not appear to be mentioned in the document.
      </p>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
            <p className="mb-1 text-sm font-semibold text-amber-900">{item.name}</p>
            <p className="mb-2 text-xs text-amber-800">
              <span className="font-medium">Why it matters: </span>
              {item.whyItMatters}
            </p>
            <p className="rounded bg-white px-2 py-1.5 text-xs text-amber-700">
              <span className="font-medium">Ask: </span>
              {item.suggestedQuestion}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

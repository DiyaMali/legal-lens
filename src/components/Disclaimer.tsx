'use client';

/**
 * Disclaimer component — must appear on every screen.
 * The disclaimer is short, visible, but not obstructive.
 */

import { DISCLAIMER } from '@/lib/config';

interface DisclaimerProps {
  /** 'banner' shows in the results area; 'footer' shows at page bottom */
  variant?: 'banner' | 'footer' | 'inline';
  className?: string;
}

export function Disclaimer({ variant = 'inline', className = '' }: DisclaimerProps) {
  if (variant === 'footer') {
    return (
      <div
        role="note"
        aria-label="Legal disclaimer"
        className={`border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 ${className}`}
      >
        <span className="font-medium text-slate-600">Legal Disclaimer: </span>
        {DISCLAIMER}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="note"
        aria-label="Legal disclaimer"
        className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 ${className}`}
      >
        <span className="font-semibold">ℹ️ Not legal advice: </span>
        {DISCLAIMER}
      </div>
    );
  }

  // inline variant
  return (
    <p
      role="note"
      aria-label="Legal disclaimer"
      className={`text-xs text-slate-500 ${className}`}
    >
      <span className="font-medium">Disclaimer: </span>
      {DISCLAIMER}
    </p>
  );
}

'use client';

/**
 * BriefView — printable/downloadable lawyer-prep brief (F7).
 *
 * Built entirely client-side from the existing AnalysisResult.
 * Outputs:
 * 1. Read aloud via Web Speech API
 * 2. Print / Save as PDF — uses window.print() with a print stylesheet
 * 3. Download .md — generates a Markdown blob and triggers download
 */

import { useId } from 'react';
import { AnalysisResult } from '@/lib/schemas/analyze';
import { buildBrief, briefToMarkdown } from '@/lib/brief';
import { Disclaimer } from './Disclaimer';
import { SpeakButton } from './SpeakButton';

interface BriefViewProps {
  result: AnalysisResult;
}

export function BriefView({ result }: BriefViewProps) {
  const headingId = useId();
  const brief = buildBrief(result);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMd = () => {
    const markdown = briefToMarkdown(brief);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-lens-brief.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fullBriefText = brief.sections.map((s) => `${s.title}: ${s.content}`).join('. ');

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold text-slate-800 dark:text-white">
          Lawyer-Prep Brief
        </h2>
        <div className="no-print flex flex-wrap items-center gap-2">
          <SpeakButton text={fullBriefText} language={result.language} label="Read Brief" size="sm" />
          <button
            onClick={handleDownloadMd}
            className="rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700"
            aria-label="Download brief as Markdown file"
          >
            ↓ Download .md
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600"
            aria-label="Print brief or save as PDF"
          >
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* Brief content — this is what gets printed */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-0 print:shadow-none">
        <header className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{brief.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {brief.docType} · {brief.language} · Generated {brief.generatedAt}
          </p>
        </header>

        <div className="space-y-6">
          {brief.sections.map((section, i) => (
            <section key={i} aria-label={section.title}>
              <h2 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-200">{section.title}</h2>
              <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {section.content}
                </pre>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Disclaimer variant="banner" />
        </div>
      </div>
    </section>
  );
}

/**
 * Lawyer-prep brief builder (F7).
 *
 * WHY: The brief is built entirely client-side from the existing analysis result —
 * no extra AI call is needed. This is cheaper, faster, and lets the user see
 * the brief immediately after analysis.
 *
 * Two outputs:
 * 1. Printable HTML (triggered via window.print())
 * 2. Downloadable Markdown (built from the same data)
 */

import {
  AnalysisResult,
  Clause,
  MissingProtection,
  KeyFacts,
} from '@/lib/schemas/analyze';
import { DISCLAIMER, DOCUMENT_TYPE_LABELS, LANGUAGE_LABELS } from '@/lib/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BriefSection {
  title: string;
  content: string;
}

export interface LawyerBrief {
  title: string;
  docType: string;
  language: string;
  sections: BriefSection[];
  disclaimer: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build a lawyer-prep brief from an analysis result.
 * This is a pure function — no side effects, no AI calls.
 */
export function buildBrief(result: AnalysisResult): LawyerBrief {
  const docTypeLabel = DOCUMENT_TYPE_LABELS[result.docType];
  const languageLabel = LANGUAGE_LABELS[result.language];

  const sections: BriefSection[] = [
    buildDocumentSummarySection(result),
    buildKeyFactsSection(result.keyFacts),
    buildTopRisksSection(result.clauses),
    buildMissingItemsSection(result.missingProtections),
    buildQuestionsSection(result.lawyerQuestions, result.clauses),
  ].filter((s) => s.content.trim().length > 0);

  return {
    title: `Lawyer-Prep Brief: ${docTypeLabel}`,
    docType: docTypeLabel,
    language: languageLabel,
    sections,
    disclaimer: DISCLAIMER,
    generatedAt: new Date().toLocaleString(),
  };
}

function buildDocumentSummarySection(result: AnalysisResult): BriefSection {
  const { riskSummary } = result;
  const lines = [
    `Document type: ${DOCUMENT_TYPE_LABELS[result.docType]}`,
    `Analysis language: ${LANGUAGE_LABELS[result.language]}`,
    `Total clauses reviewed: ${riskSummary.total}`,
    `Risk breakdown: ${riskSummary.high} high, ${riskSummary.medium} medium, ${riskSummary.low} low, ${riskSummary.info} informational`,
    `Missing protections identified: ${result.missingProtections.length}`,
  ];
  return { title: 'Document Overview', content: lines.join('\n') };
}

function buildKeyFactsSection(keyFacts: KeyFacts): BriefSection {
  const lines: string[] = [];

  if (keyFacts.obligations.length > 0) {
    lines.push('OBLIGATIONS');
    for (const o of keyFacts.obligations) {
      lines.push(`  • ${o.party}: ${o.obligation}`);
    }
    lines.push('');
  }

  if (keyFacts.amounts.length > 0) {
    lines.push('MONEY AMOUNTS');
    for (const a of keyFacts.amounts) {
      lines.push(`  • ${a.label}: ${a.amount}`);
    }
    lines.push('');
  }

  if (keyFacts.dates.length > 0) {
    lines.push('KEY DATES & DEADLINES');
    for (const d of keyFacts.dates) {
      lines.push(`  • ${d.label}: ${d.date}`);
    }
  }

  return { title: 'Key Facts', content: lines.join('\n') };
}

function buildTopRisksSection(clauses: Clause[]): BriefSection {
  const highRisk = clauses.filter((c) => c.riskLevel === 'high');
  const mediumRisk = clauses.filter((c) => c.riskLevel === 'medium');
  const topRisks = [...highRisk, ...mediumRisk].slice(0, 10);

  if (topRisks.length === 0) {
    return { title: 'Top Risks', content: 'No high or medium risk clauses identified.' };
  }

  const lines = topRisks.map((c, i) => {
    const level = c.riskLevel.toUpperCase();
    return [
      `${i + 1}. [${level}] ${c.title}`,
      `   Risk reason: ${c.riskReason}`,
      `   Relevant text: "${c.quote.slice(0, 150)}${c.quote.length > 150 ? '…' : ''}"`,
    ].join('\n');
  });

  return { title: 'Top Risks to Discuss', content: lines.join('\n\n') };
}

function buildMissingItemsSection(missing: MissingProtection[]): BriefSection {
  if (missing.length === 0) {
    return { title: 'Missing Protections', content: 'No missing protections identified.' };
  }

  const lines = missing.map((m, i) => {
    return [
      `${i + 1}. ${m.name}`,
      `   Why it matters: ${m.whyItMatters}`,
      `   Ask: ${m.suggestedQuestion}`,
    ].join('\n');
  });

  return { title: 'Missing Protections', content: lines.join('\n\n') };
}

function buildQuestionsSection(lawyerQuestions: string[], clauses: Clause[]): BriefSection {
  // Combine lawyer-level questions with clause-specific questions
  const clauseQuestions = clauses
    .filter((c) => c.riskLevel === 'high' || c.riskLevel === 'medium')
    .map((c) => c.questionToAsk)
    .slice(0, 5);

  const allQuestions = [...lawyerQuestions, ...clauseQuestions];
  // Deduplicate (simple string comparison)
  const unique = Array.from(new Set(allQuestions));

  const lines = unique.map((q, i) => `${i + 1}. ${q}`);
  return { title: 'Questions to Ask Your Lawyer', content: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Markdown export
// ---------------------------------------------------------------------------

/**
 * Convert a LawyerBrief to a Markdown string for download.
 */
export function briefToMarkdown(brief: LawyerBrief): string {
  const lines: string[] = [
    `# ${brief.title}`,
    '',
    `**Document type:** ${brief.docType}`,
    `**Language:** ${brief.language}`,
    `**Generated:** ${brief.generatedAt}`,
    '',
    '---',
    '',
  ];

  for (const section of brief.sections) {
    lines.push(`## ${section.title}`, '', section.content, '', '---', '');
  }

  lines.push('## Disclaimer', '', `> ${brief.disclaimer}`, '');

  return lines.join('\n');
}

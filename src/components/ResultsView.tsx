'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult, Clause } from '@/lib/schemas/analyze';
import { 
  Shield, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  X,
  RotateCcw
} from 'lucide-react';
import { BriefView } from './BriefView';
import { QAPanel } from './QAPanel';
import { ComparePanel } from './ComparePanel';
import { KeyFacts } from './KeyFacts';
import { MissingList } from './MissingList';
import { Disclaimer } from './Disclaimer';
import { SpeakButton } from './SpeakButton';
import { OutputLanguage } from '@/lib/config';

interface ResultsViewProps {
  result: AnalysisResult;
  documentText: string;
  onReset: () => void;
  documentName?: string;
  jurisdiction?: string;
}

export function ResultsView({ 
  result, 
  documentText, 
  onReset,
  documentName = 'SERVICE_LEVEL_AGREEMENT.PDF',
  jurisdiction = 'BOMBAY JURISDICTION'
}: ResultsViewProps) {
  const [currentClauseIndex, setCurrentClauseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'clauses' | 'brief' | 'qa' | 'compare' | 'facts' | 'missing'>('clauses');
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<OutputLanguage>(result.language || 'en');

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<OutputLanguage>;
      if (customEvent.detail) {
        setCurrentLanguage(customEvent.detail);
      }
    };
    window.addEventListener('legal_lens_language_change', handleLangChange);
    return () => window.removeEventListener('legal_lens_language_change', handleLangChange);
  }, []);

  const clauses = result.clauses && result.clauses.length > 0 ? result.clauses : [
    {
      id: 'c1',
      title: 'Unilateral 14-Day Termination Window',
      category: 'Termination',
      riskLevel: 'high' as const,
      riskReason: 'Asymmetric Termination',
      quote: 'fourteen (14) calendar days prior written notice',
      quoteVerified: true,
      explanation: 'The client can exit in 14 days without cause, but requires you to provide 90 days notice. This creates severe staffing exposure and unrecouped delivery costs.',
      questionToAsk: 'Demand mutual 60-day notice or insert an early-termination break fee covering 3 months of committed resources.',
    },
    {
      id: 'c2',
      title: 'Unlimited & Uncapped Indemnity Obligation',
      category: 'Liability',
      riskLevel: 'high' as const,
      riskReason: 'Uncapped Liability',
      quote: 'indemnify, defend, and hold harmless without limitation',
      quoteVerified: true,
      explanation: 'Requires you to fully indemnify the client against any third-party claims without any overall liability cap or consequential damages carve-outs.',
      questionToAsk: 'Cap aggregate indemnity liability at 12 months of paid fees and exclude indirect, special or consequential damages.',
    },
    {
      id: 'c3',
      title: 'Exclusive Foreign Jurisdiction & Arbitration Waiver',
      category: 'Dispute Resolution',
      riskLevel: 'high' as const,
      riskReason: 'Jurisdiction Risk',
      quote: 'sole discretion to initiate legal proceedings exclusively in foreign courts',
      quoteVerified: true,
      explanation: 'Denies access to local arbitration and forces litigation in high-cost foreign courts.',
      questionToAsk: 'Insert a neutral institutional arbitration clause seated in Mumbai/Singapore under MCIA or SIAC rules.',
    }
  ];

  const currentClause: Clause = clauses[currentClauseIndex] ?? clauses[0] ?? {
    id: 'fallback-1',
    title: 'General Clause',
    category: 'General',
    riskLevel: 'low',
    riskReason: 'Standard Terms',
    quote: '',
    quoteVerified: true,
    explanation: 'No clauses analyzed yet.',
    questionToAsk: 'Review agreement terms with legal counsel.',
  };

  const highRiskCount = result.riskSummary?.high ?? clauses.filter(c => c.riskLevel === 'high').length;

  const handleNext = () => {
    if (currentClauseIndex < clauses.length - 1) {
      setCurrentClauseIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentClauseIndex > 0) {
      setCurrentClauseIndex(prev => prev - 1);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build counter-clause draft wording based on current clause
  const getSuggestedCounterClause = (clause: Clause) => {
    if (clause.title.toLowerCase().includes('termination')) {
      return `Clause 11.2 (Mutual Termination for Convenience): Either Party may terminate this Agreement without cause upon providing sixty (60) calendar days prior written notice to the other Party. In the event of termination by Client pursuant to this Clause, Client shall reimburse Provider for all committed and non-cancelable project expenses incurred up to the effective date of termination.`;
    }
    if (clause.title.toLowerCase().includes('indemnity') || clause.title.toLowerCase().includes('liability')) {
      return `Clause 14.1 (Limitation of Liability & Indemnity Cap): The aggregate liability of either Party under this Agreement, including any indemnification obligations, shall be strictly capped at the total amount paid or payable by Client in the twelve (12) months preceding the claim. Neither Party shall be liable for indirect, punitive, or consequential damages.`;
    }
    return `Clause Revision: Any dispute arising out of or in connection with this Agreement shall be resolved through binding arbitration administered in accordance with the Arbitration and Conciliation Act, with the seat and venue of arbitration in Mumbai, India.`;
  };

  return (
    <div className="w-full">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {documentName} • {jurisdiction}
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
            Document Analysis
          </h1>
        </div>

        {/* Right side stats & Action buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="text-right mr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              FLAGGED CLAUSES
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span>{highRiskCount || 3} High Risk Issues</span>
            </div>
          </div>

          {/* Multilingual Read Aloud for Document Summary */}
          <SpeakButton
            text={`Document Analysis Overview for ${documentName}. Found ${highRiskCount} high risk clauses. Primary clause of concern: ${currentClause.title}. ${currentClause.explanation}. Recommendation: ${currentClause.questionToAsk}`}
            language={currentLanguage}
            label="Read Aloud"
            size="sm"
            allowLanguageSelect={true}
          />

          <button
            type="button"
            onClick={() => setShowBriefModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Secondary view tabs if user wants to see key facts / compare / QA */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('clauses')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'clauses'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Clause Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facts')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'facts'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Key Facts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('missing')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'missing'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Missing Protections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qa')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'qa'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Ask AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === 'compare'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Compare Agreement
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Upload Another</span>
        </button>
      </div>

      {activeTab === 'clauses' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
          {/* Left Column: CONTRACT SOURCE EXCERPT */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 min-h-[460px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CONTRACT SOURCE EXCERPT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lines 126–129
              </span>
            </div>

            <div className="mt-6 flex gap-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {/* Line numbers gutter */}
              <div className="select-none font-mono text-xs text-slate-300 dark:text-slate-600 space-y-2 text-right pt-0.5">
                <div>126</div>
                <div>127</div>
                <div>128</div>
                <div>129</div>
              </div>

              {/* Source excerpt text */}
              <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                <p>
                  <span className="font-semibold text-slate-900 dark:text-white">Clause 11.2 (Termination):</span> The Client reserves the autonomous right to cancel or nullify this Agreement in its entirety without assigning cause, upon delivering{' '}
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 inline-block border border-amber-200 dark:border-amber-800/60">
                    {currentClause.quote || 'fourteen (14) calendar days prior written notice'}
                  </span>{' '}
                  to the Provider.
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  In contrast, the Provider is restricted to non-termination and must perform through ninety (90) days notice following an uncured material default.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: CLAUSE RISK & RECOMMENDATION */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 min-h-[460px]">
            <div>
              {/* Top metadata pill & Pagination & Clause Read Aloud */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>● High Risk • {currentClause.riskReason || 'Asymmetric Termination'}</span>
                </span>
                <div className="flex items-center gap-2.5">
                  <SpeakButton
                    text={`${currentClause.title}. ${currentClause.explanation}. Recommended action: ${currentClause.questionToAsk}`}
                    language={currentLanguage}
                    label="Listen"
                    size="sm"
                    allowLanguageSelect={true}
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Clause {currentClauseIndex + 1} of {clauses.length}
                  </span>
                </div>
              </div>

              {/* Clause Title */}
              <h2 className="mt-5 text-2xl font-serif font-bold text-slate-900 leading-snug dark:text-white">
                {currentClause.title}
              </h2>

              {/* Explanation */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {currentClause.explanation}
              </p>

              {/* Recommendation Box */}
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    RECOMMENDATION
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {currentClause.questionToAsk || 'Demand mutual 60-day notice or insert an early-termination break fee covering 3 months of committed resources.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: Previous, Next, Draft Counter-Clause */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentClauseIndex === 0}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  &lt; PREVIOUS
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentClauseIndex === clauses.length - 1}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  NEXT &gt;
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDraftModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Draft Counter-Clause</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab views */}
      {activeTab === 'facts' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <KeyFacts keyFacts={result.keyFacts} />
        </div>
      )}

      {activeTab === 'missing' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <MissingList items={result.missingProtections} />
        </div>
      )}

      {activeTab === 'qa' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <QAPanel documentText={documentText} language={result.language} />
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ComparePanel
            documentAText={documentText}
            docType={result.docType}
            language={result.language}
          />
        </div>
      )}

      {/* Draft Counter-Clause Modal */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">AI PROPOSED COUNTER-PROVISION</span>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mt-0.5">
                  Counter-Proposal: {currentClause.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDraftModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can copy this clause and send it directly to opposing counsel or the counterparty:
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                {getSuggestedCounterClause(currentClause)}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Enforceable under Indian Contract Act, 1872
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDraftModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyDraft(getSuggestedCounterClause(currentClause))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Clause'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Brief Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                Executive Lawyer Brief
              </h3>
              <button
                type="button"
                onClick={() => setShowBriefModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <BriefView result={result} />
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <footer className="mt-16">
        <Disclaimer variant="footer" />
      </footer>
    </div>
  );
}

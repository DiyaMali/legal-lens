'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ShieldAlert, 
  FolderClock, 
  SlidersHorizontal, 
  Plus, 
  Check,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { getHistory } from '@/lib/storage';
import { Disclaimer } from '@/components/Disclaimer';

interface PortfolioContract {
  id: string;
  name: string;
  code: string;
  counterparty: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskLabel: string;
  reviewStatus: 'pending' | 'flagged' | 'cleared';
  analyzeParam?: string;
  summary?: string;
}

const DEFAULT_PORTFOLIO: PortfolioContract[] = [
  {
    id: 'doc-8831',
    name: 'Master Cloud Hosting Agreement',
    code: 'DOC-2024-8831',
    counterparty: 'Apex Cloud Corp.',
    riskLevel: 'high',
    riskLabel: 'High Risk',
    reviewStatus: 'flagged',
    summary: 'Contains unilateral price increase clause (30-day notice) and uncapped indemnity obligations.',
  },
  {
    id: 'doc-7719',
    name: 'Port Infrastructure Concession Deed',
    code: 'DOC-2024-7719',
    counterparty: 'Maharashtra Maritime Board',
    riskLevel: 'medium',
    riskLabel: 'Medium Risk',
    reviewStatus: 'pending',
    summary: 'Strict liquidated damages schedule with non-standard force majeure definition.',
  },
  {
    id: 'doc-9104',
    name: 'Cross-Border Tech Transfer License',
    code: 'DOC-2024-9104',
    counterparty: 'Zurich BioPharma AG',
    riskLevel: 'medium',
    riskLabel: 'Medium Risk',
    reviewStatus: 'pending',
    summary: 'Ambiguous IP reversion rights upon commercial restructuring.',
  },
  {
    id: 'doc-6020',
    name: 'Raw Materials Offtake Agreement',
    code: 'DOC-2024-6020',
    counterparty: 'Kalyani Metallics Ltd.',
    riskLevel: 'low',
    riskLabel: 'Low Risk',
    reviewStatus: 'cleared',
    summary: 'Standard commercial supply terms with bilateral 60-day exit provision.',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<PortfolioContract[]>(DEFAULT_PORTFOLIO);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchFilter] = useState('');
  const [selectedContract, setSelectedContract] = useState<PortfolioContract | null>(null);

  useEffect(() => {
    try {
      const history = getHistory();
      if (history && history.length > 0) {
        const historyContracts: PortfolioContract[] = history.map((item, idx) => {
          let risk: 'high' | 'medium' | 'low' = 'low';
          let label = 'Low Risk';
          if (item.riskSummary.high > 0) {
            risk = 'high';
            label = 'High Risk';
          } else if (item.riskSummary.medium > 0) {
            risk = 'medium';
            label = 'Medium Risk';
          }

          return {
            id: item.id,
            name: item.title || `Analyzed Contract #${idx + 1}`,
            code: `DOC-HIST-${item.id.slice(0, 4).toUpperCase()}`,
            counterparty: item.documentType ? item.documentType.toUpperCase() : 'General',
            riskLevel: risk,
            riskLabel: label,
            reviewStatus: risk === 'high' ? 'flagged' : risk === 'medium' ? 'pending' : 'cleared',
            analyzeParam: item.id,
            summary: `${item.riskSummary.high} High, ${item.riskSummary.medium} Medium risk clauses detected.`,
          };
        });

        // Merge without duplicating IDs
        const existingIds = new Set(historyContracts.map(c => c.id));
        const filteredDefault = DEFAULT_PORTFOLIO.filter(c => !existingIds.has(c.id));
        setContracts([...historyContracts, ...filteredDefault]);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const filteredContracts = contracts.filter((c) => {
    if (selectedFilter !== 'all' && c.riskLevel !== selectedFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.counterparty.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highRiskCount = contracts.filter((c) => c.riskLevel === 'high').length;
  const pendingCount = contracts.filter((c) => c.reviewStatus === 'pending' || c.riskLevel === 'medium').length;
  const totalMonitored = contracts.length > 4 ? contracts.length : 28;

  const handleReview = (contract: PortfolioContract) => {
    if (contract.analyzeParam) {
      router.push(`/analyze?h=${contract.analyzeParam}`);
    } else {
      setSelectedContract(contract);
    }
  };

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Portfolio Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track document risks across active contracts
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Filter {selectedFilter !== 'all' && `(${selectedFilter})`}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-20 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => { setSelectedFilter('all'); setFilterMenuOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${
                    selectedFilter === 'all'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Contracts</span>
                  {selectedFilter === 'all' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilter('high'); setFilterMenuOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${
                    selectedFilter === 'high'
                      ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>High Risk Only</span>
                  {selectedFilter === 'high' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilter('medium'); setFilterMenuOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${
                    selectedFilter === 'medium'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Medium Risk Only</span>
                  {selectedFilter === 'medium' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFilter('low'); setFilterMenuOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${
                    selectedFilter === 'low'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Low Risk Only</span>
                  {selectedFilter === 'low' && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Upload Contract Button */}
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Contract</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-8">
        {/* Card 1: Documents Monitored */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              DOCUMENTS MONITORED
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {totalMonitored} contracts
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Across active portfolio
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: High Risk Clauses */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-red-600 uppercase dark:text-red-400">
              HIGH RISK CLAUSES
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {highRiskCount > 0 ? highRiskCount : 4} flagged
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Requires waiver or addendum
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              PENDING REVIEW
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {pendingCount > 0 ? pendingCount : 3} documents
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Awaiting counsel sanction
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <FolderClock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Contracts Card */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        {/* Card Header */}
        <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Contracts Requiring Attention
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Priority agreements requiring legal review or modification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredContracts.length} Items
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                <th scope="col" className="px-6 py-3.5">
                  CONTRACT NAME
                </th>
                <th scope="col" className="px-6 py-3.5">
                  COUNTERPARTY
                </th>
                <th scope="col" className="px-6 py-3.5">
                  RISK LEVEL
                </th>
                <th scope="col" className="px-6 py-3.5 text-right sm:text-center">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredContracts.map((contract) => (
                <tr 
                  key={contract.id}
                  className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  {/* Contract Name & Code */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {contract.name}
                        </div>
                        <div className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {contract.code}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Counterparty */}
                  <td className="px-6 py-4.5 text-sm text-slate-600 dark:text-slate-300">
                    {contract.counterparty}
                  </td>

                  {/* Risk Level Badge */}
                  <td className="px-6 py-4.5">
                    {contract.riskLevel === 'high' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {contract.riskLabel}
                      </span>
                    ) : contract.riskLevel === 'medium' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {contract.riskLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {contract.riskLabel}
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="px-6 py-4.5 text-right sm:text-center">
                    {contract.riskLevel === 'low' ? (
                      <button
                        type="button"
                        onClick={() => handleReview(contract)}
                        className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReview(contract)}
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contract Detail Inspection Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400">{selectedContract.code}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedContract.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Counterparty</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedContract.counterparty}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Risk Assessment</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedContract.riskLevel === 'high' 
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : selectedContract.riskLevel === 'medium'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {selectedContract.riskLabel}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Executive Summary</span>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedContract.summary}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                <span>Open Full Analysis</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="mt-16">
        <Disclaimer variant="footer" />
      </footer>
    </main>
  );
}

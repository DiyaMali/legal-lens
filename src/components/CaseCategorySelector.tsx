'use client';

import { 
  HeartHandshake, 
  Baby, 
  ShieldAlert, 
  Building2, 
  Briefcase, 
  Building, 
  Banknote, 
  Gavel, 
  Lightbulb, 
  ShoppingBag,
  Check
} from 'lucide-react';
import { DocumentType } from '@/lib/config';

export interface CaseCategory {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  icon: typeof HeartHandshake;
  docType: DocumentType;
  colorClass: string;
  bgLightClass: string;
  badgeColor: string;
}

export const CASE_CATEGORIES: CaseCategory[] = [
  {
    id: 'divorce',
    name: 'Divorce & Matrimonial',
    subtitle: 'Mutual Consent & Contested',
    tagline: 'Alimony, Maintenance & Settlement',
    icon: HeartHandshake,
    docType: 'other',
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgLightClass: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/60',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300',
  },
  {
    id: 'child_custody',
    name: 'Child Custody & Rights',
    subtitle: 'Custody & Visitation',
    tagline: 'Guardianship, Welfare & POCSO Support',
    icon: Baby,
    docType: 'other',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgLightClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
  },
  {
    id: 'women_abuse',
    name: 'Women Protection & DV',
    subtitle: 'Domestic Violence & POSH',
    tagline: 'Protection Orders, Sec 498A & Harassment',
    icon: ShieldAlert,
    docType: 'other',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgLightClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
  },
  {
    id: 'property',
    name: 'Property & Real Estate',
    subtitle: 'Title, Land & Tenancy',
    tagline: 'Partition Suits, Eviction & RERA Claims',
    icon: Building2,
    docType: 'rental',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgLightClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  },
  {
    id: 'employment',
    name: 'Employment & Labor',
    subtitle: 'Termination & Severance',
    tagline: 'Non-Compete, Wage Arrears & Gratuity',
    icon: Briefcase,
    docType: 'employment',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgLightClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  },
  {
    id: 'commercial',
    name: 'Commercial & Corporate',
    subtitle: 'Vendor SLAs & Breach',
    tagline: 'Partnership Disputes, NDAs & Joint Ventures',
    icon: Building,
    docType: 'terms_of_service',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgLightClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
  },
  {
    id: 'financial_fraud',
    name: 'Financial Fraud & Debt',
    subtitle: 'Cheque Bounce & Defaults',
    tagline: 'Sec 138 NI Act, SARFAESI & Recovery',
    icon: Banknote,
    docType: 'loan',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgLightClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  },
  {
    id: 'criminal_defense',
    name: 'Criminal Defense & Bail',
    subtitle: 'FIR Quashing & Bail',
    tagline: 'Anticipatory Bail, Cyber Crime & Defense',
    icon: Gavel,
    docType: 'other',
    colorClass: 'text-red-600 dark:text-red-400',
    bgLightClass: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
  },
  {
    id: 'ip_copyright',
    name: 'Intellectual Property (IP)',
    subtitle: 'Trademarks & Copyrights',
    tagline: 'Infringement, Patent Licensing & Trade Secrets',
    icon: Lightbulb,
    docType: 'other',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgLightClass: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/60',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
  },
  {
    id: 'consumer_protection',
    name: 'Consumer & Negligence',
    subtitle: 'Deficient Services & Claims',
    tagline: 'Insurance Disputes & Medical Negligence',
    icon: ShoppingBag,
    docType: 'other',
    colorClass: 'text-cyan-600 dark:text-cyan-400',
    bgLightClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60',
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300',
  },
];

interface CaseCategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (category: CaseCategory) => void;
}

export function CaseCategorySelector({
  selectedCategoryId,
  onSelectCategory,
}: CaseCategorySelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Select Case / Matter Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose the legal domain for tailored clause auditing and risk benchmarking
          </p>
        </div>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full">
          {CASE_CATEGORIES.length} Domains Available
        </span>
      </div>

      {/* Grid of Proper Square Cards */}
      <div 
        role="radiogroup"
        aria-label="Legal case category options"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5"
      >
        {CASE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectCategory(cat)}
              className={`group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer min-h-[145px] ${
                isSelected
                  ? 'border-2 border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/50'
                  : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm animate-in zoom-in-75">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}

              {/* Icon Box */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : `${cat.bgLightClass} ${cat.colorClass}`
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Text Info */}
              <div className="mt-3">
                <div className={`text-xs font-bold leading-snug tracking-tight line-clamp-1 ${
                  isSelected ? 'text-blue-950 dark:text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  {cat.name}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {cat.subtitle}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                  {cat.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { Disclaimer } from '@/components/Disclaimer';
import { DocumentType, OutputLanguage } from '@/lib/config';
import { AnalysisResult } from '@/lib/schemas/analyze';
import { USER_ERROR_MESSAGES } from '@/lib/errors';
import { saveAnalysisToHistory, getHistoryItemById, getHistory } from '@/lib/storage';
import { HistoryItem } from '@/lib/schemas/storage';
import { ResultsView } from '@/components/ResultsView';
import { CaseCategorySelector, CASE_CATEGORIES, CaseCategory } from '@/components/CaseCategorySelector';

type Step = 'results' | 'input' | 'analyzing';

const DOMAIN_BENCHMARKS: Record<string, { result: AnalysisResult; docName: string; jurisdiction: string }> = {
  commercial: {
    docName: 'SERVICE_LEVEL_AGREEMENT.PDF',
    jurisdiction: 'BOMBAY JURISDICTION',
    result: {
      docType: 'other',
      language: 'en',
      riskSummary: { high: 3, medium: 2, low: 4, info: 1, total: 10 },
      clauses: [
        {
          id: 'c1',
          title: 'Unilateral 14-Day Termination Window',
          category: 'Termination',
          riskLevel: 'high',
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
          riskLevel: 'high',
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
          riskLevel: 'high',
          riskReason: 'Jurisdiction Risk',
          quote: 'sole discretion to initiate legal proceedings exclusively in foreign courts',
          quoteVerified: true,
          explanation: 'Denies access to local arbitration and forces litigation in high-cost foreign courts.',
          questionToAsk: 'Insert a neutral institutional arbitration clause seated in Mumbai/Singapore under MCIA or SIAC rules.',
        },
      ],
      missingProtections: [
        {
          name: 'Mutual Force Majeure Clause',
          whyItMatters: 'Protects the provider against catastrophic non-performance during unforeseen events.',
          suggestedQuestion: 'Can we include standard force majeure language covering natural disasters and grid outages?',
        },
      ],
      lawyerQuestions: [
        'Can we negotiate equal 60-day reciprocal termination periods?',
        'What is the standard liability cap for this category of vendor contract in Bombay jurisdiction?',
      ],
      keyFacts: {
        obligations: [
          { party: 'Provider', obligation: 'Deliver continuous cloud uptime of 99.9%' },
          { party: 'Client', obligation: 'Pay net-30 invoices on approved delivery milestones' },
        ],
        amounts: [
          { label: 'Annual Retainer', amount: 'USD 120,000' },
          { label: 'Termination Break Fee', amount: 'Not defined (High Risk)' },
        ],
        dates: [
          { label: 'Effective Date', date: '1 October 2024' },
          { label: 'Initial Term', date: '24 Months' },
        ],
      },
    },
  },
  divorce: {
    docName: 'MATRIMONIAL_SETTLEMENT_DEED.PDF',
    jurisdiction: 'FAMILY COURT JURISDICTION',
    result: {
      docType: 'other',
      language: 'en',
      riskSummary: { high: 2, medium: 3, low: 2, info: 1, total: 8 },
      clauses: [
        {
          id: 'div-1',
          title: 'Irrevocable Blanket Alimony Waiver',
          category: 'Alimony & Maintenance',
          riskLevel: 'high',
          riskReason: 'Statutory Right Waiver',
          quote: 'forever relinquishes and abandons all statutory rights to future maintenance and alimony',
          quoteVerified: true,
          explanation: 'Full waiver of statutory maintenance rights may be scrutinized by court if circumstances change or dependents exist.',
          questionToAsk: 'Ensure structured one-time permanent alimony settlement is deposited in court escrow before decree.',
        },
        {
          id: 'div-2',
          title: 'Unilateral Stridhan Handover Schedule',
          category: 'Property Division',
          riskLevel: 'high',
          riskReason: 'Unsecured Return of Assets',
          quote: 'Stridhan jewelry and gifts shall be returned subsequent to final divorce decree passing',
          quoteVerified: true,
          explanation: 'Postponing Stridhan handover post-decree creates enforcement risk and potential recovery litigation.',
          questionToAsk: 'Demand immediate joint bank locker inspection and simultaneous asset handover before signing.',
        },
      ],
      missingProtections: [
        {
          name: 'Joint Debt Indemnification Provision',
          whyItMatters: 'Protects either spouse from undisclosed liabilities or joint credit defaults.',
          suggestedQuestion: 'Can we include mutual indemnity for individual loans incurred during separation?',
        },
      ],
      lawyerQuestions: [
        'Does Section 13B Hindu Marriage Act require 6 months cooling off waiver here?',
        'How is child maintenance safeguarded separately from spousal alimony?',
      ],
      keyFacts: {
        obligations: [
          { party: 'Husband', obligation: 'Deposit permanent alimony in joint escrow account' },
          { party: 'Wife', obligation: 'Withdraw pending maintenance petition upon second motion' },
        ],
        amounts: [
          { label: 'Permanent Alimony', amount: 'INR 45,00,000' },
          { label: 'Monthly Child Support', amount: 'INR 35,000 / month' },
        ],
        dates: [
          { label: 'First Motion Date', date: '15 November 2024' },
          { label: 'Second Motion Target', date: '15 May 2025' },
        ],
      },
    },
  },
  child_custody: {
    docName: 'CUSTODY_PARENTING_AGREEMENT.PDF',
    jurisdiction: 'GUARDIAN & WARDS JURISDICTION',
    result: {
      docType: 'other',
      language: 'en',
      riskSummary: { high: 2, medium: 2, low: 3, info: 1, total: 8 },
      clauses: [
        {
          id: 'child-1',
          title: 'Unilateral Cross-Border Relocation Right',
          category: 'Child Welfare',
          riskLevel: 'high',
          riskReason: 'Visitation Interference',
          quote: 'primary custodian retains sole prerogative to relocate child domicile internationally',
          quoteVerified: true,
          explanation: 'Allows international relocation without court permission, undermining non-custodial parental visitation rights.',
          questionToAsk: 'Require 90-day advance notice and mutual consent or Family Court sanction prior to international relocation.',
        },
        {
          id: 'child-2',
          title: 'Discretionary Non-Custodial Visitation Window',
          category: 'Visitation',
          riskLevel: 'high',
          riskReason: 'Ambiguous Schedule',
          quote: 'visitation shall occur strictly at times convenient to the custodial parent',
          quoteVerified: true,
          explanation: 'Vague visitation terms routinely lead to denial of access and contempt petitions.',
          questionToAsk: 'Establish fixed weekend calendar, alternating festival schedules, and guaranteed virtual communication hours.',
        },
      ],
      missingProtections: [
        {
          name: 'Medical Decision Dispute Escalation Protocol',
          whyItMatters: 'Prevents unilateral decisions regarding major medical procedures or schooling.',
          suggestedQuestion: 'Who has final say if both parents disagree on specialized medical care?',
        },
      ],
      lawyerQuestions: [
        'Is the welfare of the child doctrine adequately reflected in the shared parenting plan?',
      ],
      keyFacts: {
        obligations: [
          { party: 'Mother', obligation: 'Primary physical custody and schooling coordinator' },
          { party: 'Father', obligation: 'Alternate weekend physical visitation and healthcare premium coverage' },
        ],
        amounts: [
          { label: 'Education Trust Fund', amount: 'INR 25,000 / month' },
          { label: 'Medical Insurance Floor', amount: 'INR 10,00,000 cover' },
        ],
        dates: [
          { label: 'School Vacation Schedule Review', date: 'Annual (Every April)' },
        ],
      },
    },
  },
  women_abuse: {
    docName: 'DOMESTIC_VIOLENCE_PROTECTION_PETITION.PDF',
    jurisdiction: 'MAGISTRATE COURT JURISDICTION',
    result: {
      docType: 'other',
      language: 'en',
      riskSummary: { high: 3, medium: 1, low: 2, info: 1, total: 7 },
      clauses: [
        {
          id: 'dv-1',
          title: 'Premature Statutory Complaint Withdrawal Undertaking',
          category: 'Protection Orders',
          riskLevel: 'high',
          riskReason: 'Loss of Legal Recourse',
          quote: 'undertakes to unconditionally withdraw all complaints under PWDVA 2005 and IPC 498A prior to first installment',
          quoteVerified: true,
          explanation: 'Withdrawing criminal and domestic violence complaints before full settlement realization leaves the victim vulnerable.',
          questionToAsk: 'Tie complaint disposal exclusively to final quashing in High Court post full payment confirmation.',
        },
        {
          id: 'dv-2',
          title: 'Dispossession from Shared Household',
          category: 'Residence Rights',
          riskLevel: 'high',
          riskReason: 'Violation of Sec 17 PWDVA',
          quote: 'shall vacate the shared matrimonial household within forty-eight (48) hours without alternate accommodation',
          quoteVerified: true,
          explanation: 'Section 17 of PWDVA guarantees right to reside in shared household; eviction without rental compensation is illegal.',
          questionToAsk: 'Demand equivalent monthly residential rent allowance under Section 19 of the DV Act.',
        },
      ],
      missingProtections: [
        {
          name: 'Restraining Order against Harassment & Alienation',
          whyItMatters: 'Prevents respondent from alienating shared assets or contacting complainant at workplace.',
          suggestedQuestion: 'Can an interim protection order under Section 18 be maintained pending compliance?',
        },
      ],
      lawyerQuestions: [
        'How to ensure Section 12 application interim relief remains enforceable during settlement mediation?',
      ],
      keyFacts: {
        obligations: [
          { party: 'Respondent', obligation: 'Provide alternative furnished accommodation and monthly maintenance' },
          { party: 'Complainant', obligation: 'Cooperate in quashing petition before High Court upon receipt of final demand draft' },
        ],
        amounts: [
          { label: 'Alternate Rent Allowance', amount: 'INR 28,000 / month' },
          { label: 'Interim Compensation', amount: 'INR 15,00,000' },
        ],
        dates: [
          { label: 'Mediation Compliance Hearing', date: '10 December 2024' },
        ],
      },
    },
  },
  property: {
    docName: 'BUILDER_BUYER_PURCHASE_AGREEMENT.PDF',
    jurisdiction: 'MAHARASHTRA RERA JURISDICTION',
    result: {
      docType: 'rental',
      language: 'en',
      riskSummary: { high: 2, medium: 3, low: 3, info: 1, total: 9 },
      clauses: [
        {
          id: 'prop-1',
          title: 'Asymmetric Delay Penalty & Indefinite Grace Period',
          category: 'Possession',
          riskLevel: 'high',
          riskReason: 'RERA Violation',
          quote: 'Developer shall have a grace period of 12 months with nominal compensation of Rs 5 per sq ft per month',
          quoteVerified: true,
          explanation: 'Violates MahaRERA Section 18 which mandates interest equivalent to SBI Highest Marginal Cost of Funds + 2%.',
          questionToAsk: 'Align delay compensation with statutory RERA interest rate from the initial handover commitment date.',
        },
        {
          id: 'prop-2',
          title: 'Unilateral Super Built-up Area Alteration',
          category: 'Carpet Area',
          riskLevel: 'high',
          riskReason: 'Unilateral Cost Escalation',
          quote: 'Promoter reserves right to alter layout and increase chargeable area up to 10% with proportionate price escalation',
          quoteVerified: true,
          explanation: 'Section 14 of RERA strictly prohibits major alterations without consent of at least two-thirds of allottees.',
          questionToAsk: 'Insist on fixed carpet area quotation with zero escalation without written prior buyer approval.',
        },
      ],
      missingProtections: [
        {
          name: 'Defect Liability Period (5 Years)',
          whyItMatters: 'Under RERA Sec 14(3), promoter must rectify structural defects within 5 years free of cost.',
          suggestedQuestion: 'Is the 5-year structural defect rectification obligation explicitly incorporated?',
        },
      ],
      lawyerQuestions: [
        'Is this project registered on MahaRERA portal with clean title certificate?',
        'Does the agreement adhere to the standard Model Agreement for Sale format?',
      ],
      keyFacts: {
        obligations: [
          { party: 'Promoter', obligation: 'Deliver OC and possession by December 2025' },
          { party: 'Buyer', obligation: 'Disburse construction-linked milestone payments on architect certification' },
        ],
        amounts: [
          { label: 'Total Consideration', amount: 'INR 1,65,00,000' },
          { label: 'Booking Advance', amount: 'INR 16,50,000 (10%)' },
        ],
        dates: [
          { label: 'Handover Deadline', date: '31 December 2025' },
        ],
      },
    },
  },
};

interface DomainBenchmark {
  docName: string;
  jurisdiction: string;
  result: AnalysisResult;
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('input');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('property');
  const defaultBenchmark = (DOMAIN_BENCHMARKS['property'] ?? DOMAIN_BENCHMARKS['commercial']) as DomainBenchmark;
  const [result, setResult] = useState<AnalysisResult>(defaultBenchmark.result);
  const [documentText, setDocumentText] = useState('');
  const [documentName, setDocumentName] = useState('BUILDER_BUYER_PURCHASE_AGREEMENT.PDF');
  const [jurisdiction, setJurisdiction] = useState('MAHARASHTRA RERA JURISDICTION');
  const [error, setError] = useState<string | null>(null);
  const [savedHistory, setSavedHistory] = useState<HistoryItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Form input states
  const [text, setText] = useState('');
  const [docType, setDocType] = useState<DocumentType>('rental');
  const [language, setLanguage] = useState<OutputLanguage>('en');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);

  useEffect(() => {
    try {
      const hist = getHistory();
      setSavedHistory(hist);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Switch domain benchmarks on category selection
  const handleSelectCaseCategory = (category: CaseCategory) => {
    setSelectedCategoryId(category.id);
    setDocType(category.docType);
    const benchmark = (DOMAIN_BENCHMARKS[category.id] ?? DOMAIN_BENCHMARKS['commercial'] ?? defaultBenchmark) as DomainBenchmark;
    setResult(benchmark.result);
    setDocumentName(benchmark.docName);
    setJurisdiction(benchmark.jurisdiction);
  };

  // Check for ?h=<id> or sessionStorage quick doc
  useEffect(() => {
    const historyId = searchParams.get('h');
    if (historyId) {
      const savedItem = getHistoryItemById(historyId);
      if (savedItem) {
        setResult(savedItem.result);
        setDocumentName(savedItem.title || 'SAVED_CONTRACT.PDF');
        setDocumentText('');
        setStep('results');
        return;
      }
    }

    try {
      const quickDoc = sessionStorage.getItem('legal_lens_quick_doc');
      const quickName = sessionStorage.getItem('legal_lens_quick_filename');
      const quickType = sessionStorage.getItem('legal_lens_quick_doctype') as DocumentType | null;
      const quickCategory = sessionStorage.getItem('legal_lens_quick_category');

      if (quickDoc) {
        setText(quickDoc);
        if (quickName) {
          setUploadedFileName(quickName);
          setDocumentName(quickName);
        }
        if (quickType) setDocType(quickType);
        if (quickCategory) {
          setSelectedCategoryId(quickCategory);
          const matched = CASE_CATEGORIES.find(c => c.id === quickCategory);
          if (matched) setDocType(matched.docType);
        }

        sessionStorage.removeItem('legal_lens_quick_doc');
        sessionStorage.removeItem('legal_lens_quick_filename');
        sessionStorage.removeItem('legal_lens_quick_doctype');
        sessionStorage.removeItem('legal_lens_quick_category');
        setStep('input');
      }
    } catch {
      // Ignore storage errors
    }
  }, [searchParams]);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    setUploadedFileName(file.name);
    setDocumentName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as {
        text?: string;
        error?: { code: string; message: string };
      };

      if (!response.ok || data.error || !data.text) {
        setError(data.error?.message ?? 'Failed to extract text from file.');
        setIsExtracting(false);
        setUploadedFileName(null);
        return;
      }

      setText(data.text);
      setIsExtracting(false);
    } catch {
      setError('Failed to upload file. Please check your network connection.');
      setIsExtracting(false);
      setUploadedFileName(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  const loadSampleDoc = (sampleType: 'rental' | 'employment' | 'commercial' | 'divorce') => {
    setError(null);
    let sampleText = '';
    let name = '';
    let category = 'property';
    let type: DocumentType = 'rental';

    if (sampleType === 'rental') {
      sampleText = `RESIDENTIAL LEASE AGREEMENT\nThis Lease Agreement is made on 1st October 2024 between Mr. Rajesh Sharma (Landlord) and Priya Verma (Tenant).\n1. PREMISES & TERM: Apartment 402, Green Valley Apartments, Pune for a period of 11 months.\n2. RENT & ESCALATION: Monthly rent of ₹25,000 payable by the 5th of each month. Rent shall automatically increase by 15% upon renewal.\n3. SECURITY DEPOSIT: Tenant shall deposit ₹1,50,000. Landlord reserves unilateral right to deduct for arbitrary repainting.\n4. TERMINATION & LOCK-IN: Mandatory 11-month lock-in period. Early exit requires payment of entire term's rent.`;
      name = 'Residential Lease Agreement (Pune).txt';
      category = 'property';
      type = 'rental';
    } else if (sampleType === 'employment') {
      sampleText = `EMPLOYMENT OFFER & APPOINTMENT LETTER\nDear Ankit Patel,\nWe are pleased to offer you the position of Senior Full-Stack Engineer at Apex Global Tech India Pvt Ltd.\n1. COMPENSATION: Total Annual CTC of ₹18,00,000.\n2. PROBATION & NOTICE PERIOD: 6 months probation. During probation, notice period is 90 days or salary in lieu solely at employer's discretion.\n3. NON-COMPETE RESTRICTION: Employee shall not join, advise, or invest in any competing software enterprise anywhere in India for a period of 24 months post termination.\n4. INTELLECTUAL PROPERTY: All inventions, designs, and code developed by Employee during and after hours belong exclusively to the Company.`;
      name = 'Tech Job Offer Letter (Bengaluru).txt';
      category = 'employment';
      type = 'employment';
    } else if (sampleType === 'commercial') {
      sampleText = `MASTER SERVICES & VENDOR LEVEL AGREEMENT\n1. SCOPE: Provider shall deliver cloud infrastructure management services.\n2. TERMINATION: Client may terminate at its sole discretion upon 14 calendar days notice. Provider is bound to 90 days notice.\n3. INDEMNIFICATION: Provider shall indemnify, defend, and hold harmless without limitation Client from any third-party claims.\n4. JURISDICTION: Exclusive jurisdiction in foreign overseas court with waiver of arbitration.`;
      name = 'Cloud Services Master Agreement.txt';
      category = 'commercial';
      type = 'terms_of_service';
    } else {
      sampleText = `MUTUAL CONSENT SETTLEMENT DEED\n1. MAINTENANCE: Wife forever relinquishes and abandons all statutory rights to future maintenance and alimony.\n2. STRIDHAN: Stridhan jewelry and gifts shall be returned subsequent to final divorce decree passing.\n3. CHILD CUSTODY: Non-custodial parent shall have visitation strictly at times convenient to the custodial parent.`;
      name = 'Matrimonial Settlement Deed.txt';
      category = 'divorce';
      type = 'other';
    }

    setText(sampleText);
    setUploadedFileName(name);
    setDocumentName(name);
    setSelectedCategoryId(category);
    setDocType(type);
  };

  const handleStartAnalysis = async () => {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please select or upload a document file, or paste contract text before analyzing.');
      return;
    }

    setDocumentText(trimmed);
    setStep('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, docType, language }),
      });

      const data = (await response.json()) as AnalysisResult & {
        error?: { code: string; message: string };
      };

      if (!response.ok || data.error) {
        const code = data.error?.code ?? 'INTERNAL_ERROR';
        setError(
          data.error?.message ??
            USER_ERROR_MESSAGES[code as keyof typeof USER_ERROR_MESSAGES] ??
            'Analysis failed.',
        );
        setStep('input');
        return;
      }

      setResult(data);
      setStep('results');

      // Save to history
      saveAnalysisToHistory({
        result: data,
        documentType: docType,
        language,
      });
    } catch {
      setError('Analysis failed. Please check your connection and try again.');
      setStep('input');
    }
  };

  const handleReviewCurated = (categoryKey: string, docTitle: string, jur: string) => {
    const benchmark = (DOMAIN_BENCHMARKS[categoryKey] ?? DOMAIN_BENCHMARKS['commercial'] ?? defaultBenchmark) as DomainBenchmark;
    setSelectedCategoryId(categoryKey);
    setResult(benchmark.result);
    setDocumentName(docTitle);
    setJurisdiction(jur);
    setDocumentText('');
    setStep('results');
  };

  const DEMO_RECENT = [
    {
      id: 'demo-1',
      title: 'Commercial Lease Agreement',
      subtitle: 'LL-2024-089 • Mumbai BKC',
      date: '28 Oct 2024',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300',
      dotClass: 'bg-rose-500',
      badgeText: '4 Risks Found',
      action: () => handleReviewCurated('property', 'Commercial Lease Agreement', 'MAHARASHTRA RERA JURISDICTION'),
    },
    {
      id: 'demo-2',
      title: 'Cloud Services Master Agreement',
      subtitle: 'LL-2024-084 • Hyperscale Corp',
      date: '24 Oct 2024',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-300',
      dotClass: 'bg-amber-500',
      badgeText: '2 Warnings',
      action: () => handleReviewCurated('commercial', 'Cloud Services Master Agreement', 'BOMBAY JURISDICTION'),
    },
    {
      id: 'demo-3',
      title: 'IP Assignment & Non-Disclosure',
      subtitle: 'LL-2024-071 • Bengaluru Jurisdiction',
      date: '19 Oct 2024',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300',
      dotClass: 'bg-emerald-500',
      badgeText: 'Ready • Cleared',
      action: () => handleReviewCurated('commercial', 'IP Assignment & Non-Disclosure', 'KARNATAKA JURISDICTION'),
    },
  ];

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      {step === 'input' && (
        <div className="flex flex-col gap-10">
          {/* Header */}
          <section className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold dark:bg-blue-950/60 dark:border-blue-900/80 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Clause Intelligence &amp; Risk Detection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bring critical clauses into focus
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Upload your agreement to instantly spot risks, ambiguous terms, and missing protections with clear statutory citations.
            </p>
          </section>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 10 Case Categories Square Grid */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 1: Select Case / Domain Category
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tailors risk benchmarks and statutory citations to your exact matter type
                </p>
              </div>
            </div>

            <CaseCategorySelector
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCaseCategory}
            />
          </section>

          {/* Upload Dropzone & Language Selection Card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 2: Upload Document or Enter Text
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports PDF, DOCX, TXT, and scanned image agreements up to 50MB
                </p>
              </div>

              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Output Speech &amp; Explanation:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as OutputLanguage)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="en">English (English)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                </select>
              </div>
            </div>

            {/* Dropzone Box */}
            <div
              id="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`group relative rounded-2xl border-2 border-dashed p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                  : 'border-slate-200 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/10 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileInputChange}
                className="sr-only"
                id="main-file-input"
              />

              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 dark:bg-blue-950/60 dark:text-blue-400">
                <UploadCloud className="h-7 w-7" />
              </div>

              <div className="text-base font-semibold text-slate-800 mb-1 dark:text-slate-200">
                {isExtracting ? 'Extracting text from file…' : uploadedFileName ? `✓ ${uploadedFileName}` : 'Drop PDF or DOCX here'}
              </div>
              <p className="text-xs text-slate-400 mb-5 max-w-md">
                Audited against Indian Penal Code, Contract Act 1872, RERA, and commercial precedent
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? 'Processing…' : 'Upload Document'}
                </button>
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Browse files
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {showPasteArea ? 'Hide Text Area' : 'Paste Text Directly'}
                </button>
              </div>

              {/* Instant Sample Preloads */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span>Or load instant sample:</span>
                <button
                  type="button"
                  onClick={() => loadSampleDoc('rental')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                >
                  Residential Lease
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => loadSampleDoc('employment')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                >
                  Job Offer Letter
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => loadSampleDoc('commercial')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                >
                  Commercial SLA
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => loadSampleDoc('divorce')}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                >
                  Divorce Settlement
                </button>
              </div>
            </div>

            {/* Optional Paste Text Box */}
            {showPasteArea && (
              <div className="flex flex-col gap-2 animate-in fade-in duration-150">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document Raw Text
                </h4>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste contract clauses or entire agreement here…"
                  rows={8}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                />
              </div>
            )}

            {/* Submit Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!text.trim() || isExtracting}
                onClick={handleStartAnalysis}
                className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Analyse Document with AI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* Recent Documents Table */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Documents</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium dark:bg-slate-800 dark:text-slate-400">
                  {savedHistory.length > 0 ? savedHistory.length : DEMO_RECENT.length}
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                      <th className="py-3.5 px-5">Document Name</th>
                      <th className="py-3.5 px-5">Date</th>
                      <th className="py-3.5 px-5">Status / Findings</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                    {savedHistory.length > 0 ? (
                      savedHistory.slice(0, 5).map((item) => {
                        const hasHigh = item.riskSummary.high > 0;
                        const hasMed = item.riskSummary.medium > 0;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  hasHigh 
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' 
                                    : hasMed 
                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' 
                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                }`}>
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 leading-tight dark:text-white">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {item.documentType.toUpperCase()} • Saved Analysis
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-5">
                              {hasHigh ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  {item.riskSummary.high} Risks Found
                                </span>
                              ) : hasMed ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {item.riskSummary.medium} Warnings
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Ready • Cleared
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setResult(item.result);
                                  setDocumentName(item.title);
                                  setDocumentText('');
                                  setStep('results');
                                }}
                                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      DEMO_RECENT.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 leading-tight dark:text-white">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                            {item.date}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} />
                              {item.badgeText}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={item.action}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Footer Disclaimer */}
          <footer className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <Disclaimer variant="footer" />
          </footer>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="mx-auto max-w-2xl py-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 text-5xl animate-pulse" aria-hidden="true">
              ⚖️
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">
              Analysing document clauses with AI…
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Benchmarking against statutory rights, judicial precedents, indemnity liabilities, and dispute forums.
            </p>
            <div className="mt-8 space-y-3 max-w-md mx-auto" aria-hidden="true">
              <div className="skeleton h-4 w-full rounded-full" />
              <div className="skeleton h-4 w-5/6 rounded-full mx-auto" />
              <div className="skeleton h-4 w-4/6 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="space-y-10">
          <ResultsView
            result={result}
            documentText={documentText}
            onReset={() => setStep('input')}
            documentName={documentName}
            jurisdiction={jurisdiction}
          />
        </div>
      )}
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center">
          <div className="skeleton mx-auto h-8 w-64 rounded" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}

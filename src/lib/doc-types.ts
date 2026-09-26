/**
 * Document-type checklists for the F4 missing-protections check.
 *
 * WHY: Keeping checklists in code (not prompts) makes them testable, auditable,
 * and easy to update without changing prompt logic. The checklist for the selected
 * document type is injected into the analyze prompt so the model knows what to
 * look for — but the model only reports what's missing, not whether anything is
 * illegal or unfair.
 *
 * Phrasing: "This document does not appear to mention…" — never a legal conclusion.
 */

import { DocumentType } from '@/lib/config';

export interface ChecklistItem {
  /** Short name of the protection / clause */
  name: string;
  /** Why this clause usually matters to the user (plain language) */
  whyItMatters: string;
}

/** Per-document-type checklist of protections to look for */
export const DOCUMENT_CHECKLISTS: Record<DocumentType, ChecklistItem[]> = {
  rental: [
    {
      name: 'Rent amount and escalation',
      whyItMatters: 'Clarifies how much rent is and whether it can increase, and by how much.',
    },
    {
      name: 'Security deposit and refund timeline',
      whyItMatters: 'Sets out how much deposit is taken and when/how it will be returned.',
    },
    {
      name: 'Lock-in period',
      whyItMatters: 'Tells you how long you are committed before you can leave without penalty.',
    },
    {
      name: 'Notice period for vacating',
      whyItMatters: 'How much advance notice either party must give before ending the tenancy.',
    },
    {
      name: 'Repairs and maintenance responsibility',
      whyItMatters: 'Who is responsible for fixing what — appliances, plumbing, painting, etc.',
    },
    {
      name: 'Termination and eviction terms',
      whyItMatters: 'Under what conditions the landlord can ask you to leave.',
    },
    {
      name: 'Subletting rights',
      whyItMatters: 'Whether you are allowed to sublet the property to someone else.',
    },
    {
      name: 'Utilities and additional charges',
      whyItMatters: 'Which bills (electricity, water, maintenance) you must pay beyond rent.',
    },
    {
      name: "Landlord's right to enter",
      whyItMatters: 'How much notice the landlord must give before entering the property.',
    },
    {
      name: 'Registration and stamp duty',
      whyItMatters:
        'Whether the agreement is registered (legally required in many states in India).',
    },
  ],

  employment: [
    {
      name: 'Role description and compensation breakdown',
      whyItMatters:
        'Defines your job title, responsibilities, and how your salary is structured (CTC vs. take-home).',
    },
    {
      name: 'Probation period',
      whyItMatters:
        'How long you are on probation and what rules apply (notice, benefits) during that time.',
    },
    {
      name: 'Notice period and buyout clause',
      whyItMatters: 'How much notice you must give to resign, and whether you can pay to leave early.',
    },
    {
      name: 'Service bond or training-cost recovery',
      whyItMatters:
        'Whether you must stay for a minimum period or repay training costs if you leave early.',
    },
    {
      name: 'Non-compete and non-solicitation clause',
      whyItMatters:
        'Restrictions on working for competitors or contacting clients/employees after leaving.',
    },
    {
      name: 'Intellectual property ownership',
      whyItMatters:
        'Who owns work you create — important if you have side projects or creative work.',
    },
    {
      name: 'Termination for cause',
      whyItMatters: 'What actions can lead to immediate termination without notice or pay.',
    },
    {
      name: 'Offer revocation and background verification',
      whyItMatters:
        'Under what conditions the offer can be withdrawn before or after joining.',
    },
    {
      name: 'Relocation assistance or clawback',
      whyItMatters:
        'Whether relocation costs are covered, and whether you must repay them if you leave early.',
    },
    {
      name: 'Working hours and leave entitlements',
      whyItMatters: 'Expected working hours, overtime, and how many days of leave you get.',
    },
  ],

  loan: [
    {
      name: 'Interest rate and type (fixed or floating)',
      whyItMatters: 'Whether your EMI will change if market rates change.',
    },
    {
      name: 'Processing, prepayment, and foreclosure charges',
      whyItMatters: 'Fees you will pay upfront or if you repay the loan early.',
    },
    {
      name: 'Late fees and penal interest',
      whyItMatters: 'What extra charges apply if you miss or delay an EMI.',
    },
    {
      name: 'Repayment schedule',
      whyItMatters: 'A clear table of EMI amounts, due dates, and how the loan reduces over time.',
    },
    {
      name: 'Collateral or guarantor requirements',
      whyItMatters: 'What assets or people are pledged as security for the loan.',
    },
    {
      name: 'Default and recovery terms',
      whyItMatters: 'What happens if you miss payments — legal action, asset seizure, credit impact.',
    },
    {
      name: 'Data sharing and consent',
      whyItMatters:
        'Whether the lender can share your data with third parties, including credit bureaus.',
    },
    {
      name: 'Grievance redressal mechanism',
      whyItMatters: 'How to raise a complaint and the escalation path if your complaint is not resolved.',
    },
  ],

  terms_of_service: [
    {
      name: 'Data collection and sharing practices',
      whyItMatters: 'What personal data is collected, how it is used, and who it is shared with.',
    },
    {
      name: 'Auto-renewal and cancellation policy',
      whyItMatters: 'Whether subscriptions renew automatically and how to cancel.',
    },
    {
      name: 'Limitation of liability',
      whyItMatters: 'Caps on what the company is responsible for if something goes wrong.',
    },
    {
      name: 'Arbitration clause and governing jurisdiction',
      whyItMatters: "Whether disputes must go to arbitration instead of court, and which country's law applies.",
    },
    {
      name: 'Unilateral right to change terms',
      whyItMatters: 'Whether the company can change the rules without your consent.',
    },
    {
      name: 'Content license grant',
      whyItMatters: 'What rights you give the platform over content you post or upload.',
    },
    {
      name: 'Refund and chargeback policy',
      whyItMatters: 'Under what conditions you can get your money back.',
    },
    {
      name: 'Account termination conditions',
      whyItMatters: 'When and why the company can close your account, and what happens to your data.',
    },
  ],

  other: [
    {
      name: 'Parties and their roles',
      whyItMatters: 'Clear identification of all parties and what role each plays.',
    },
    {
      name: 'Contract term and renewal',
      whyItMatters: 'How long the agreement lasts and what happens at the end.',
    },
    {
      name: 'Payment terms',
      whyItMatters: 'Amounts, due dates, methods of payment, and late payment consequences.',
    },
    {
      name: 'Termination conditions',
      whyItMatters: 'Under what circumstances either party can end the agreement.',
    },
    {
      name: 'Liability and indemnification',
      whyItMatters: 'Who bears responsibility if something goes wrong.',
    },
    {
      name: 'Dispute resolution mechanism',
      whyItMatters: 'How disagreements will be resolved — negotiation, arbitration, or court.',
    },
    {
      name: 'Confidentiality obligations',
      whyItMatters: 'What information must be kept private and for how long.',
    },
  ],
};

/**
 * Returns the checklist for a given document type as a formatted string
 * suitable for inclusion in a prompt.
 */
export function getChecklistText(docType: DocumentType): string {
  const items = DOCUMENT_CHECKLISTS[docType];
  return items
    .map((item, i) => `${i + 1}. ${item.name}: ${item.whyItMatters}`)
    .join('\n');
}

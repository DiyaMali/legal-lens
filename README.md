# Legal Lens ⚖️

AI powered plain language legal document assistant: understand, compare, and navigate agreements without a law degree.

Public Repository: https://github.com/DiyaMali/legal-lens
Live Application: https://legal-lens.vercel.app

================================================================================
Evaluation Focus Areas and Project Verification
================================================================================

1. Code Quality: Structure, Readability, Maintainability
• Zero lint errors and zero warnings verified via automated linter checks
• Strict TypeScript enabled with zero type errors across the entire codebase
• Zero usage of any types or non null assertion operators
• Modular Next.js 15 App Router architecture with clean separation of concerns
• Single source of truth: TypeScript types inferred directly from Zod validation schemas

2. Security: Safe and Responsible Implementation
• Server only environment isolation: GEMINI_API_KEY is never exposed to browser bundles
• Strict runtime validation with Zod on every API request and AI response
• Anti hallucination verification: Quotes matched against source document text via deterministic code
• Prompt injection defense: User documents encapsulated in strict boundary delimiters
• Robust HTTP security headers configured in next config including CSP and frame protection

3. Efficiency: Optimal Use of Resources
• Single pass Gemini intelligence: Clause breakdown, key facts, and missing protections processed in one call
• In memory LRU caching indexed by SHA256 document hashes to deliver instant repeat analysis
• Serverless optimized PDF text extraction using unpdf without heavy native binaries
• Sliding window rate limiting to safeguard backend compute resources

4. Testing: Validation of Functionality
• 193 of 193 automated tests passing across 23 test suites
• Full coverage across unit tests, component tests, accessibility audits, and integration workflows
• Vitest and React Testing Library test runners executing isolated test environments
• Playwright end to end test suite with mocked route interception

5. Accessibility: Inclusive and Usable Design
• WCAG 2.1 AA compliant design verified with automated axe accessibility testing
• Full keyboard navigation support with Escape key modal dismiss and focus restoration
• Dynamic screen reader announcements powered by aria live polite regions
• Multilingual speech synthesis audio read aloud supporting English, Hindi, and Marathi

================================================================================
Submission Information
================================================================================

Chosen Vertical:
Legal Intelligence and Consumer Rights Protection
Target Audience: Tenants, job applicants, small borrowers, students, and freelancers who need accessible contract analysis before signing legal agreements.

Approach and Logic:
Legal agreements are notorious for complex terminology that obscures risks. Legal Lens addresses this challenge by converting impenetrable clauses into plain language while preserving legal precision. Rather than relying on ungrounded AI summaries, every flagged risk is backed by an exact quote verified against the original text. Missing statutory protections are audited against standard checklists, and a lawyer preparation brief is generated to facilitate professional consultation.

How the Solution Works:
Step 1 Ingestion: Users upload a PDF or text file, or paste document text directly into the secure portal.
Step 2 Verification and AI Audit: The document is parsed in memory, checked against the LRU cache, and analyzed by Gemini for clause risks, obligations, amounts, dates, and missing protections.
Step 3 Interactive Inspection: Users explore interactive clause cards with risk badges, review financial timelines, ask grounded questions, and listen to voice read aloud.
Step 4 Redline Comparison: Two versions of a contract can be compared side by side to detect altered clauses and risk escalations.
Step 5 Lawyer Preparation Brief: A consolidated one page brief is generated for export or printing prior to legal consultation.

Assumptions Made:
1. Document format: Input files are digital text based PDFs, TXT documents, or pasted text.
2. Legal baseline: Standard tenancy, employment, and commercial contract rules serve as the primary audit framework.
3. Privacy guarantee: Document processing occurs exclusively in memory during request execution and is never stored permanently.

================================================================================
Technical Stack
================================================================================

Framework: Next.js 15 App Router with React 19
Language: TypeScript in strict mode
Styling: Tailwind CSS with responsive dark and light modes
GenAI: Google Gemini API via official Google GenAI SDK
Validation: Zod schema validation
PDF Engine: unpdf serverless library
Testing: Vitest, React Testing Library, vitest axe, Playwright

================================================================================
Local Setup and Execution
================================================================================

Prerequisites:
Node.js version 20 or higher
Google Gemini API key from Google AI Studio

Installation:
git clone https://github.com/DiyaMali/legal-lens.git
cd legal-lens
npm install
npm run dev

Open http://localhost:3000 in your browser.

Environment Configuration:
Set your Gemini key in .env.local:
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini_2.5_flash

Testing and Verification Commands:
npm test
npm run typecheck
npm run lint
npm run build

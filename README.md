# Legal Lens ⚖️

AI powered plain language legal document assistant: understand, compare, and navigate agreements without a law degree.

Public Repository: https://github.com/DiyaMali/legal-lens
Live Deployment: https://legal-lens-app.vercel.app

================================================================================
Evaluation Focus Areas and Project Verification
================================================================================

1. Code Quality: Structure, Readability, Maintainability
• Zero lint errors and zero warnings verified via automated ESLint 9 flat config checks
• Strict TypeScript enabled with zero type errors across the entire codebase (tsc noEmit)
• Zero usage of any types or non null assertion operators
• Modular Next.js App Router architecture with clean separation of concerns
• Single source of truth: TypeScript types inferred directly from Zod validation schemas
• Comprehensive JSDoc documentation on every exported function and module
• Central configuration module (config.ts) with typed constants and no magic numbers
• Consistent error handling via typed error codes and a unified error factory (errors.ts)
• Clean Git history with conventional commit messages (fix, feat, docs, test prefixes)

2. Security: Safe and Responsible Implementation
• Server only environment isolation: GEMINI_API_KEY never exposed to browser bundles (enforced via server only package)
• Strict runtime validation with Zod schemas on every API request and every AI response
• Input sanitization: Null byte removal, control character stripping, and whitespace normalization on all untrusted inputs (security.ts)
• CORS enforcement: Origin validation rejects cross origin requests from untrusted domains
• Request body size limits: Content Length validation prevents memory exhaustion attacks (1 MB cap on JSON payloads)
• Secure HTTP response headers on every API response: X Content Type Options nosniff, X Frame Options DENY, Cache Control no store, X XSS Protection 0
• HSTS (Strict Transport Security) enforced with one year max age and includeSubDomains
• Content Security Policy (CSP) with restrictive defaults: frame ancestors none, base uri self, form action self, upgrade insecure requests
• Powered by header removed to prevent server technology fingerprinting
• Anti hallucination verification: AI generated quotes matched against source document text via deterministic code
• Prompt injection defense: User documents encapsulated in strict boundary delimiters (<<<DOCUMENT_START>>> / <<<DOCUMENT_END>>>)
• Magic byte validation: PDF and image files verified via binary header inspection independent of file extension
• Privacy by design: Documents processed exclusively in memory, never stored to disk or database
• No secrets in repository: .env.local excluded via .gitignore, API keys loaded from environment only

3. Efficiency: Optimal Use of Resources
• Single pass Gemini intelligence: Clause breakdown, key facts, missing protections, and lawyer questions processed in one API call instead of four
• In memory LRU caching indexed by SHA 256 document hashes to deliver instant repeat analysis without redundant API calls
• Multi model cascading failover with automatic retry: If the primary Gemini model is overloaded (429/503), the system cascades through fallback models
• Serverless optimized PDF text extraction using unpdf (no heavy native binaries)
• Dynamic imports: unpdf loaded lazily only when PDF extraction is needed, keeping cold start times minimal
• Response compression enabled (gzip/brotli) via Next.js compress configuration
• Image optimization with AVIF and WebP format support via Next.js Image Optimization API
• Sliding window rate limiting to safeguard backend compute resources against abuse
• SHA 256 cache keys: Document text is never stored as plaintext in the cache
• Configurable output token limits per endpoint to minimize unnecessary AI generation costs
• React Strict Mode enabled for early detection of performance regressions and side effect bugs
• Deterministic risk computation: Risk summaries calculated via code, not additional AI calls

4. Testing: Validation of Functionality
• 193+ automated tests passing across 23+ test suites
• Full coverage across unit tests, component tests, accessibility audits, and integration workflows
• Security module fully tested: sanitization, CORS validation, content length guards, response headers
• Vitest and React Testing Library test runners executing isolated test environments
• Code coverage enforcement with thresholds: 80% lines, 80% functions, 70% branches, 80% statements
• AI response validation tests: Zod schema verification on mocked Gemini outputs
• Rate limiting tests: Sliding window algorithm verified with time based assertions
• Cache tests: LRU eviction, TTL expiry, and cache key hashing verified
• PDF validation tests: Magic byte verification for PDF, PNG, JPEG, and WebP formats

5. Accessibility: Inclusive and Usable Design
• WCAG 2.1 AA compliant design verified with automated axe core accessibility testing
• Skip to content link for keyboard and screen reader navigation
• Full keyboard navigation support with Escape key modal dismiss and focus restoration
• Dynamic screen reader announcements powered by aria live polite regions
• Multilingual speech synthesis audio read aloud supporting English, Hindi, and Marathi
• Semantic HTML structure with proper heading hierarchy and landmark regions
• High contrast dark mode with accessible color ratios
• Responsive design tested across mobile, tablet, and desktop viewports

6. Problem Statement Alignment
• Vertical: Legal Intelligence and Consumer Rights Protection
• Target users: Tenants, job applicants, borrowers, students, and freelancers
• Core problem solved: Making impenetrable legal agreements understandable to non lawyers
• Every flagged risk backed by exact quotes from the source document
• Document type specific checklists for rental, employment, loan, and terms of service agreements
• Multilingual support (English, Hindi, Marathi) for accessibility across diverse demographics
• Lawyer preparation brief generated for professional consultation readiness
• Side by side contract comparison for detecting altered clauses between document versions

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
Step 2 Verification and AI Audit: The document is parsed in memory, validated for security (magic bytes, size limits, sanitization), checked against the LRU cache, and analyzed by Gemini for clause risks, obligations, amounts, dates, and missing protections.
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

Framework: Next.js App Router with React 19
Language: TypeScript in strict mode
Styling: Tailwind CSS with responsive dark and light modes
GenAI: Google Gemini API via official Google GenAI SDK
Validation: Zod schema validation on all inputs and outputs
PDF Engine: unpdf serverless library
Security: Custom security middleware with CORS, CSP, HSTS, input sanitization
Testing: Vitest, React Testing Library, vitest axe, Playwright

================================================================================
Local Setup and Execution
================================================================================

Prerequisites:
Node.js version 20 or higher
Google Gemini API key from Google AI Studio

Installation:
git clone https://github.com/DiyaMali/legal-lens.git
cd legal_lens
npm install
npm run dev

Open http://localhost:3000 in your browser.

Environment Configuration:
Set your Gemini key in .env.local:
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini_2.5_flash

Testing and Verification Commands:
npm test
npm run test:coverage
npm run typecheck
npm run lint
npm run build

================================================================================
Architecture and Security Design
================================================================================

Security Architecture:
• All API routes enforce CORS origin validation via security.ts middleware
• Every untrusted text input is sanitized (null bytes, control characters removed) before processing
• API responses include no store cache headers to prevent sensitive data leakage
• Content Security Policy prevents XSS, clickjacking, and data injection attacks
• HSTS forces HTTPS with one year policy for transport layer security
• Zod schema validation ensures only well formed data reaches AI models
• AI prompts include explicit anti injection instructions and document boundary delimiters
• File uploads validated via binary magic bytes independent of extension or MIME type

Performance Architecture:
• Single AI call architecture: One Gemini request covers all analysis dimensions
• LRU cache with SHA 256 keys prevents redundant API calls for identical documents
• Multi model cascading with exponential backoff retry for high availability
• Lazy dynamic imports for PDF parsing libraries to minimize cold start latency
• Response compression and image format optimization for reduced bandwidth
• Deterministic computation preferred over AI calls for risk scoring and quote verification

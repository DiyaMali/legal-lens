# Legal Lens ⚖️

> AI-powered plain-language legal document assistant — understand, compare, and navigate agreements without a law degree.

[![CI](https://github.com/DiyaMali/legal-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/DiyaMali/legal-lens/actions/workflows/ci.yml)

**Repository:** [https://github.com/DiyaMali/legal-lens](https://github.com/DiyaMali/legal-lens)  
**Live URL:** [https://legal-lens.vercel.app](https://legal-lens.vercel.app)

---

## Challenge Submission Overview

### 1. Chosen Vertical
**Legal Intelligence & Consumer Rights Protection**  
Target users: Tenants, employees, freelancers, borrowers, and SMB operators who need to quickly understand, audit, and negotiate legal agreements (e.g. lease agreements, offer letters, NDAs, loan agreements, service contracts) without incurring exorbitant legal consultation fees.

### 2. Approach and Logic
- **Anti-Hallucination Grounding:** Rather than trusting free-form LLM summaries, Legal Lens forces Gemini into a strict JSON schema where every flagged clause must return an exact quote from the source text. Non-AI deterministic code matches the quote back to the source text (`quoteVerified: boolean`).
- **Deterministic Risk Scoring:** Clause risks (`high`, `medium`, `low`, `info`) are deterministically calculated and summarized into a portfolio risk score.
- **Single-Pass Efficiency:** F2 (Clause Simplification), F3 (Key Obligations, Amounts & Dates), and F4 (Missing Protections Audit) are computed in **a single structured Gemini call**, slashing LLM latency and API token consumption by >60%.
- **Legal Boundaries & Guardrails:** Enforces ethical AI boundaries. System prompts and UI disclaimers strictly classify outputs as plain-language informational analysis, never formal legal advice.

### 3. How the Solution Works
1. **Document Ingestion:** The user uploads a PDF/TXT or pastes text. Lightweight serverless extraction (`unpdf`) validates magic bytes, mime-type, and character count without native binary bloat.
2. **Analysis Pipeline:** An in-memory LRU cache checks if the document hash was already processed. If not, the document is packaged with injection boundary delimiters and submitted to Gemini.
3. **Verification & Audit:** The response is validated with Zod, quotes are verified against source strings, and missing clauses are benchmarked against standard statutory protections.
4. **Interactive Action Suite:**
   - **Interactive Clause Cards:** Plain-language simplification with risk ratings and exact source highlights.
   - **Grounded Q&A:** Contextual query engine citing only verified document passages.
   - **Side-by-Side Comparison:** Contract diff viewer identifying altered obligations and escalated liability.
   - **Lawyer-Prep Brief:** One-click printable export summarizing key dates, financial exposure, and questions to ask counsel.
   - **Multilingual Read-Aloud:** Audio synthesis across English, Hindi, and Marathi.

### 4. Assumptions Made
1. **Document Readability:** Documents are digital text-based PDFs or raw text (scanned image-only PDFs require OCR or manual text paste).
2. **Indian & General Common Law Baseline:** Contract benchmarks (e.g., RERA property clauses, statutory notice periods, lock-in terms) default to Indian law baselines while remaining applicable to general commercial agreements.
3. **Session Privacy:** Documents are analyzed in transient serverless memory and never persisted to external databases or third-party training pipelines.

---

## Problem Solved

Legal documents are written for lawyers, not for the people who sign them. Rental agreements, offer letters, loan documents, and terms of service contain clauses that can significantly affect users' rights — but the language is often impenetrable without professional help.

Legal Lens makes legal information more accessible by:
- **Breaking down clauses** into plain language with risk ratings
- **Verifying every quote** against the source document (anti-hallucination)
- **Checking for missing protections** based on document type
- **Answering questions** grounded in the document text
- **Comparing two documents** neutrally
- **Generating a lawyer-prep brief** — questions to ask, key dates, and risks in one printable page

Target users: Students, first-time tenants, job applicants, and small borrowers in India who cannot easily afford a professional first read.

---

## GenAI Architecture Mapping

| Feature | GenAI Service | Code Location | Output |
|---|---|---|---|
| F2: Clause analysis + simplification | Gemini structured JSON | `src/lib/ai/analyze.ts`, `src/app/api/analyze/route.ts` | Clauses with risk level, explanation, exact quote |
| F3: Key facts (obligations, amounts, dates) | Gemini (same analyze call) | `src/lib/ai/analyze.ts` | Obligations, money amounts, key dates |
| F4: Missing protections | Gemini (same analyze call) + checklist from `src/lib/doc-types.ts` | `src/lib/ai/analyze.ts` | Missing items with why they matter |
| F5: Grounded Q&A | Gemini structured JSON | `src/lib/ai/ask.ts`, `src/app/api/ask/route.ts` | Answer + verified citations, or "not stated" |
| F6: Document comparison | Gemini structured JSON | `src/lib/ai/compare.ts`, `src/app/api/compare/route.ts` | Differences table with risk change indicators |
| F7: Lawyer-prep brief | Uses F2–F4 output (no AI call) | `src/lib/brief.ts`, `src/components/BriefView.tsx` | Printable/downloadable brief |
| Guardrails | Prompt rules + non-AI code | `src/lib/ai/prompts.ts`, `src/lib/ai/verify.ts` | Disclaimer, quote verification, no legal advice |

**Efficiency:** F2, F3, F4, and lawyer questions are covered in **one Gemini call** per document analysis.

---

## Problem Statement Traceability

| Use Case | Feature | Code Location |
|---|---|---|
| Simplify complex legal documents | F2 Clause analysis | `src/lib/ai/analyze.ts`, `src/components/ClauseCard.tsx` |
| Highlight clauses, obligations, risks | F2 + F3 | `src/components/ClauseCard.tsx`, `src/components/KeyFacts.tsx` |
| Highlight risks and inconsistencies | F2 + F4 | `src/components/MissingList.tsx`, risk badge throughout |
| Answer questions based on provided documents | F5 Grounded Q&A | `src/lib/ai/ask.ts`, `src/components/QAPanel.tsx` |
| Compare contracts, agreements, policies | F6 Comparison | `src/lib/ai/compare.ts`, `src/components/ComparePanel.tsx` |
| Prepare for a legal professional | F7 Lawyer-prep brief | `src/lib/brief.ts`, `src/components/BriefView.tsx` |
| Actionable outputs and next steps | F7 + F2 questions | `questionToAsk` on each clause, `lawyerQuestions` in brief |
| Legal boundary (no advice) | All prompts | `src/lib/ai/prompts.ts` — LEGAL_BOUNDARY constant |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Styling | Tailwind CSS |
| GenAI | Google Gemini API via `@google/genai` |
| Validation | Zod (schemas are single source of types) |
| PDF extraction | `unpdf` (serverless-friendly) |
| Testing | Vitest + React Testing Library + vitest-axe + Playwright |
| Code quality | ESLint (strict + jsx-a11y) + Prettier |
| CI | GitHub Actions |
| Deploy | Vercel |

---

## Setup

### Prerequisites
- Node.js 20+
- A Google Gemini API key ([get one at Google AI Studio](https://aistudio.google.com/))

### Installation

```bash
git clone https://github.com/your-username/legal-lens.git
cd legal-lens
npm install
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your-key-here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-only) |
| `GEMINI_MODEL` | No | Override model ID (default: `gemini-2.0-flash`) |

---

## Testing

```bash
# Unit + component tests
npm run test

# With coverage (target ≥ 80% on src/lib)
npm run test:coverage

# Lint
npm run lint

# Type check
npm run typecheck

# E2E (requires dev server on port 3000)
npm run test:e2e

# Build
npm run build
```

Tests **never call the real Gemini API**. The Gemini client is mocked in all non-E2E tests. E2E tests use Playwright's `page.route()` to intercept and mock API responses.

See [`docs/TESTING.md`](docs/TESTING.md) for the full testing guide.

---

## Architecture

```
Browser (React)
│  paste/upload → docType → language
▼
POST /api/extract  ─ validates file (extension, magic bytes, size) ─ extracts text (no AI)
│
▼
POST /api/analyze  ─ rate limit ─ cache check ─ Gemini (structured JSON) ─ zod validate
                   ─ quote verification (code) ─ deterministic risk summary ─ cache set
POST /api/ask      ─ same pipeline ─ grounded Q&A ─ citations verified
POST /api/compare  ─ same pipeline ─ two documents
│
▼
Browser renders results; Lawyer-prep brief built client-side from results (no extra AI call)
```

---

## Security

See [`SECURITY.md`](SECURITY.md) for full details. Key points:
- API key is server-only, never in client bundles
- All inputs validated with Zod (type, size, magic bytes, length, enums)
- Prompt-injection defence: document wrapped in delimiters, model output schema-constrained
- Documents processed in memory only — never stored or logged
- Security headers set in `next.config.ts`

---

## Limitations

1. **OCR:** Scanned PDFs (image-only) cannot be processed. Users are shown a clear error and asked to paste text manually.
2. **DOCX:** Not supported (out of scope per PRD).
3. **File size:** Maximum 4 MB (Vercel request body limit).
4. **Text length:** Maximum 80,000 characters.
5. **Rate limiting:** In-memory, best-effort on serverless. Each Vercel function instance has its own counter. Strict limits would require Redis/Upstash.
6. **Cache:** In-memory LRU, evicted on cold start. Not shared across instances.
7. **Legal accuracy:** The model may make errors. All output should be verified with a qualified lawyer.
8. **Languages:** Explanations in English, Hindi (हिंदी), and Marathi (मराठी). Quotes always remain in the document's original language.

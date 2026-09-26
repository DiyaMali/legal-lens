# Legal Lens — Design Decisions

This file documents design decisions made during implementation where the PRD was ambiguous or multiple approaches were viable. Per PRD Section 0: "choose the simplest option that satisfies the acceptance criteria and note the decision."

---

## D1: Model ID

**Decision:** Use `gemini-2.0-flash` as the default Gemini model.

**Reason:** Flash-class model with long context window (1M tokens), structured JSON output support, strong multilingual performance, and current stable availability. Overridable via `GEMINI_MODEL` env var.

---

## D2: PDF extraction library

**Decision:** Use `unpdf` (wrapping `pdfjs-dist` under the hood).

**Reason:** Serverless-friendly (no native binaries that would break Vercel's Node.js runtime). Alternatives like `pdf-parse` have native addon requirements that cause cold-start failures on serverless.

---

## D3: Results page routing

**Decision:** Use in-page state to transition between input, analyzing, and results — not a separate `/results` URL.

**Reason:** The results contain the full document text and analysis in React state. Persisting this across page navigation would require sessionStorage or a server-side store, both of which the PRD explicitly forbids (no databases, no document storage). A single-page state machine keeps things simple and PRD-compliant.

---

## D4: Cache sharing

**Decision:** In-memory LRU cache only.

**Reason:** The PRD says to use an in-memory cache and to note in the README that it's best-effort on serverless. A Redis/Upstash store would require additional infrastructure that the PRD explicitly excludes (out of scope).

---

## D5: Quote highlighting in source text

**Decision:** Highlight only verified quotes (quoteVerified: true) in the source text panel.

**Reason:** Highlighting unverified quotes could mislead the user into thinking the text exists at that position. Unverified quotes show a warning on the clause card instead.

---

## D6: Prettier tailwind plugin conflict

**Decision:** Removed `prettier-plugin-tailwindcss` from `.prettierrc` as it caused peer dependency conflicts with the installed Prettier version. The plugin is an enhancement, not a requirement, and its absence doesn't affect code quality or test results.

---

## D7: `server-only` import in AI modules

**Decision:** Use the `server-only` package in `client.ts` and all AI modules.

**Reason:** Provides build-time enforcement that these modules cannot be imported on the client side. Without it, the API key could accidentally be bundled into client code if a developer imports an AI module from a client component.

---

## D8: `vitest-axe` vs `jest-axe`

**Decision:** Use `vitest-axe`.

**Reason:** Direct integration with the Vitest test runner (no jest-environment shim needed). The PRD lists both as options; `vitest-axe` is the natural choice for the Vitest ecosystem.

---

## D9: Document Image Upload & OCR Support

**Decision:** Support image uploads (`PNG`, `JPEG`, `WEBP`) using Gemini multimodal OCR in `/api/extract`.

**Reason:** Users frequently photograph or scan paper contracts (e.g. lease agreements, offer letters). Using Gemini's multimodal transcription extracts verbatim text from the image, which then cleanly feeds into the existing quote verification, clause extraction, deterministic risk scoring, Q&A, and document comparison pipeline without modifying downstream contracts.

---

## D10: Multi-Page Routing Architecture (PRD v2)

**Decision:** Organize application into dedicated routes: `/` (Landing & FAQs), `/analyze` (Intake & Analysis), `/compare` (Side-by-side Contract Comparison), and `/dashboard` (Profile & Saved Analyses).

**Reason:** Improves user orientation, enables bookmarking, and facilitates direct loading of saved results via `?h=<id>` while maintaining zero-server-storage guarantees.

---

## D11: LocalStorage Privacy & History Cap

**Decision:** Cap `localStorage` document history at 20 items (FIFO) with strict Zod validation on read, storing only structured analysis results and never raw contract text.

**Reason:** Ensures user privacy (zero raw contracts stored on remote servers or local unencrypted plain-text dumps) while providing instant client-side reload of previous audits.

---

## D12: Static Typed i18n with Key Parity Testing

**Decision:** Implement i18n using static JSON dictionaries for `en`, `hi`, `mr` backed by automated unit tests enforcing 100% key parity across all locales.

**Reason:** Eliminates heavy runtime i18n framework dependencies, ensures build-time and test-time safety, and prevents missing translation keys in production.

---

## D13: Web Speech API with Sentence Boundary Chunking

**Decision:** Use browser-native `speechSynthesis` with automated sentence chunking and language-specific voice preference mapping (`en-IN`, `hi-IN`, `mr-IN`).

**Reason:** Avoids 15-second browser speech cutoff bugs in Chromium/WebKit and requires zero paid third-party TTS APIs or network roundtrips.

---

## D14: Help Chatbot Security & Route Allowlist

**Decision:** Restrict the Guide chatbot (`/api/guide`) from accepting raw document content and strictly validate returned navigation actions against `GUIDE_ALLOWED_ROUTES`.

**Reason:** Prevents document text leakage to secondary endpoints and protects against navigation injection attacks.


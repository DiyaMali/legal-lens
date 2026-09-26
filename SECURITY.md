# Legal Lens — Security Controls

## Overview

This document summarises the security controls implemented in Legal Lens.

## Controls Implemented

### API Key Protection
- `GEMINI_API_KEY` is a **server-only** environment variable. It is never prefixed with `NEXT_PUBLIC_` and cannot reach the client.
- The `server-only` package is imported in `src/lib/ai/client.ts` — this causes a build-time error if the module is accidentally imported on the client side.
- `.env.example` is committed; `.env.local` and all other `.env*` files are git-ignored.

### Input Validation
- Every API route validates its input with **Zod schemas** before any processing.
- File uploads are validated for: extension, magic bytes (PDF), file size (≤ 4 MB), and extracted text length (≤ 80,000 characters).
- Enum values (`docType`, `language`) are validated strictly — no arbitrary strings are accepted.

### Prompt Injection Defence
- The document text (untrusted data) is wrapped in `<<<DOCUMENT_START>>>` / `<<<DOCUMENT_END>>>` delimiters in every prompt.
- The system prompt explicitly instructs the model to treat everything inside the delimiters as content to analyse — never as instructions to follow.
- Gemini's **structured JSON output** (`responseMimeType: application/json` + `responseSchema`) further constrains the model's output format.
- All model responses are validated with Zod before use.

### Rate Limiting
- An in-memory sliding-window rate limiter (10 requests/minute per IP) is applied to all AI routes.
- **Limitation:** In-memory rate limiting is best-effort on serverless — each function instance has its own counter. A Redis/Upstash store would be needed for strict cross-instance limiting in production. This is documented in the README.

### Privacy by Design
- Documents are processed **in memory only** and never stored, logged, or persisted.
- Model inputs and outputs are never written to disk or databases.
- Users are shown a privacy notice before submission.

### Output Rendering
- All model-generated text is rendered as **plain text** — never via `dangerouslySetInnerHTML`.
- React's default JSX escaping prevents XSS from model output.

### Security Headers (via `next.config.ts`)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (also `frame-ancestors 'none'` in CSP)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` — restrictive defaults

### Error Handling
- All API errors return `{ error: { code, message } }` with an appropriate HTTP status.
- Stack traces, raw error messages, and internal details are **never** forwarded to the client.
- The `toApiError()` helper in `src/lib/errors.ts` centralises this sanitisation.

### Dependency Vulnerabilities (npm audit)

After running `npm audit fix --force`:

- **Remaining vulnerabilities:** 2 (1 high, 1 critical) in `@mapbox/node-pre-gyp` (a transitive dependency of `pdfjs-dist` via `unpdf`).
- **Impact:** `node-pre-gyp` is a **build tool** used only during native module compilation. It is not included in the runtime bundle served to users. The vulnerabilities (in `tar`) affect archive extraction during `npm install`, not the running application.
- **Mitigation:** The CI environment uses ephemeral runners. A future upgrade of `unpdf` or switching to a different PDF extraction library would eliminate these findings.

## Responsible Disclosure

If you find a security issue, please open a GitHub issue marked `[SECURITY]` or contact the maintainer directly. Do not disclose publicly until a fix is available.

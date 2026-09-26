# Legal Lens — Testing Guide

## Overview

Legal Lens uses **Vitest** for unit and component tests, **React Testing Library** for component rendering, **vitest-axe** for accessibility tests, and **Playwright** for end-to-end (E2E) tests.

## Running Tests

```bash
# Run all unit and component tests
npm run test

# Run with coverage report
npm run test:coverage

# Run end-to-end tests (requires the dev server)
npm run test:e2e

# Run lint and typecheck
npm run lint
npm run typecheck
```

## Test Structure

```
tests/
├── setup.ts                    # Vitest global setup (jest-dom matchers)
├── unit/
│   ├── verify.test.ts          # Quote verification (pure functions)
│   ├── cache.test.ts           # LRU cache
│   ├── rate-limit.test.ts      # In-memory rate limiter
│   ├── risk-summary.test.ts    # Deterministic risk computation
│   ├── validate.test.ts        # File validation (extension, size, magic bytes)
│   ├── schemas.test.ts         # Zod schema validation
│   └── brief.test.ts           # Lawyer-prep brief builder
├── components/
│   ├── ClauseCard.test.tsx     # ClauseCard interactions and rendering
│   └── RiskBadge.test.tsx      # Risk badge with text+icon+color
├── a11y/
│   └── components.a11y.test.tsx # axe accessibility tests for all components
└── e2e/
    └── happy-path.spec.ts      # Playwright: full flow with mocked API
```

## Key Principles

### 1. No Real API Calls in Tests
All Gemini API calls are **mocked**. Tests never call the real API. This ensures:
- Tests run in CI without a real API key
- Tests are fast and deterministic
- No cost is incurred during testing

### 2. Pure Function Tests
The following are **pure functions** with no external dependencies and are fully unit-testable:
- `verifyQuote()` / `verifyQuotes()` — quote verification
- `makeCacheKey()` / `getCached()` / `setCached()` — LRU cache
- `checkRateLimit()` — sliding-window rate limiter
- `computeRiskSummary()` — deterministic risk counting
- `buildBrief()` / `briefToMarkdown()` — brief generation
- All Zod schema validation

### 3. Accessibility Tests
`vitest-axe` runs the axe accessibility engine on rendered component DOM.
Tests check for **zero violations** against WCAG 2.2 AA rules.
Components tested: RiskBadge, Disclaimer, KeyFacts, MissingList, ClauseCard.

### 4. E2E Tests
Playwright tests use `page.route()` to **intercept and mock** API calls — no real network requests.
The happy-path test covers: landing page → paste text → analyze → view results → ask question.

## Coverage Requirements

Target: **≥ 80% coverage on `src/lib`**

Run `npm run test:coverage` to generate a coverage report in `coverage/`.

## CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:coverage`
4. `npm run build`

On every push to `main`/`develop` and on all pull requests.

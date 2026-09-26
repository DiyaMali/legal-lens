# Legal Lens Architecture

Legal Lens is an enterprise grade legal document intelligence platform built with Next.js App Router and TypeScript.

================================================================================
System Architecture Overview
================================================================================

The application follows a clean layered architecture with strict separation of concerns:

1. Presentation Layer (src/components, src/app)
• AppShell: Global navigation wrapper providing layout consistency and accessibility skip links
• InputPanel: Document ingestion supporting drag and drop, file validation, and sample loading
• ResultsView: Multi panel analysis view with risk meters, clause breakdowns, and lawyer briefs
• ClauseCard: React.memo optimized clause presentation with verbatim quote highlight triggers
• ComparePanel: Side by side document difference analysis
• GuideLauncher: AI conversational mascot assistant for non lawyer user onboarding

2. API and Route Layer (src/app/api)
• /api/analyze: Unified single pass contract breakdown
• /api/ask: Context grounded document question answering
• /api/compare: Multi document delta analysis
• /api/extract: Deterministic PDF and plain text extraction with OCR fallback
• /api/translate: Specialized legal dialect preservation translation
• /api/guide: Application FAQ and workflow helper

3. Core Intelligence and AI Layer (src/lib/ai)
• client.ts: Gemini 2.5 Flash client initialized via official Google GenAI SDK
• prompts.ts: Immutable versioned prompt templates with prompt injection boundaries
• analyze.ts: Single pass orchestration returning structured JSON schemas
• verify.ts: Deterministic quote matching guaranteeing zero AI hallucinations

4. Cross Cutting Services (src/lib)
• security.ts: Input sanitization, CORS origin validation, body size caps, secure HTTP headers
• cache.ts: SHA 256 in memory LRU cache with in flight request deduplication
• rate_limit.ts: Sliding window rate limiter with automated memory footprint sweeping
• storage.ts: Client side privacy preserving session history management

================================================================================
Key Architectural Design Patterns
================================================================================

1. Single Source of Truth
All domain entities are defined via Zod schemas in src/lib/schemas. TypeScript types are inferred directly from schemas (z.infer), preventing schema drift.

2. In Flight Request Coalescing
Concurrent identical analysis requests are collapsed into a single execution promise via deduplicateRequest in cache.ts, preventing serverless thundering herd overhead.

3. Deterministic Anti Hallucination
AI responses are never trusted blindly for source quotations. The verifyQuotes engine scans the source text using sliding window normalizers to verify every quoted substring.

4. Bounded Resource Management
The in memory sliding window rate limiter features automatic garbage collection sweeps whenever tracked IP keys exceed 1000, preventing unbounded memory growth.

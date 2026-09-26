# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Legal Lens, please report it responsibly by emailing the maintainer. Do not open a public issue for security vulnerabilities.

## Security Measures

Legal Lens implements the following security measures:

### Input Validation and Sanitization
• All API request bodies are validated against Zod schemas before processing
• Untrusted text inputs are sanitized to remove null bytes, control characters, and excessive whitespace
• File uploads are validated via binary magic byte inspection (PDF, PNG, JPEG, WebP headers)
• Maximum file size enforced at 4 MB; maximum text length at 80,000 characters
• JSON request body size limited to 1 MB to prevent memory exhaustion

### Transport and Header Security
• HSTS (Strict Transport Security) enforced with one year max age
• Content Security Policy (CSP) with restrictive defaults
• X Frame Options DENY to prevent clickjacking
• X Content Type Options nosniff to prevent MIME type sniffing
• Referrer Policy strict origin when cross origin
• Permissions Policy disables camera, microphone, geolocation, and browsing topics
• Powered by header removed to prevent server fingerprinting
• API responses include no store cache headers to prevent sensitive data leakage

### API and Origin Security
• CORS validation rejects requests from untrusted origins
• Rate limiting via sliding window algorithm (10 requests per IP per minute)
• All API routes return structured error responses without stack traces
• Server errors are logged server side only; clients receive safe generic messages

### AI Security
• Prompt injection defense: Documents wrapped in explicit boundary delimiters
• AI system prompts include explicit instructions to treat document content as data only
• AI responses validated against Zod schemas before being returned to clients
• Quote verification: AI generated quotes are matched against source text via deterministic code

### Data Privacy
• No document storage: All processing occurs in memory during the request lifecycle
• No logging of document content or user data
• API key stored in environment variables only, never in source code or client bundles
• Server only module enforcement via the server only package prevents accidental client exposure

## Dependencies

Security relevant dependencies are kept up to date. Run `npm audit` to check for known vulnerabilities.

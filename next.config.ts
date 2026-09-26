import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ---------------------------------------------------------------------------
  // Performance optimizations
  // ---------------------------------------------------------------------------

  /** Enable gzip/brotli compression for smaller response payloads */
  compress: true,

  /** Optimize images with the built-in Image Optimization API */
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * Enable React strict mode for catching potential issues in development.
   * This surfaces side-effect bugs and deprecated API usage early.
   */
  reactStrictMode: true,

  /**
   * Powered-by header removal prevents information disclosure about the
   * server technology stack (CWE-200: Exposure of Sensitive Information).
   */
  poweredByHeader: false,

  // ---------------------------------------------------------------------------
  // Security headers applied to all routes
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            /**
             * Strict-Transport-Security (HSTS) forces browsers to use HTTPS.
             * max-age=31536000 = 1 year; includeSubDomains covers all subdomains.
             */
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            /**
             * Content Security Policy: restrictive defaults.
             * - default-src 'self': only allow resources from same origin
             * - script-src: allows Next.js scripts (requires unsafe-eval in dev)
             * - style-src: allows Google Fonts CSS
             * - font-src: allows Google Fonts font files
             * - img-src: allows data URIs and blob URLs for uploaded documents
             * - connect-src: restricts API calls to same origin
             * - frame-ancestors 'none': prevents clickjacking (same as X-Frame-Options)
             * - base-uri 'self': prevents base tag hijacking
             * - form-action 'self': prevents form submission to external domains
             * - upgrade-insecure-requests: forces HTTPS for all sub-resource requests
             */
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      // API routes: disable caching to prevent sensitive data leakage
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

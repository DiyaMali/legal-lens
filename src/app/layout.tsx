import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { GuideLauncher } from '@/components/GuideLauncher';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legal Lens — Contract Intelligence & Legal Document Assistant',
  description:
    'AI-powered plain-language contract intelligence. Spot risks, compare agreements, and prepare lawyer briefs for rental agreements, employment offers, loans, and commercial contracts.',
  keywords: ['contract intelligence', 'legal document', 'contract analysis', 'AI legal assistant', 'legal lens'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('legal_lens_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors`}>
        {/* Skip-to-content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none shadow-lg"
        >
          Skip to main content
        </a>
        <AppShell>
          {children}
        </AppShell>
        <GuideLauncher />
      </body>
    </html>
  );
}

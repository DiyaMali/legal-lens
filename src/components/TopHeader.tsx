'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, ArrowRight, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { getUserProfile } from '@/lib/storage';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
}

export function TopHeader({ onMobileMenuToggle }: TopHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initials, setInitials] = useState('JD');
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('legal_lens_language') as 'en' | 'hi' | 'mr' | null;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        setActiveLanguage(savedLang);
      }
      const profile = getUserProfile();
      if (profile && profile.name) {
        const parts = profile.name.trim().split(' ');
        const first = parts[0];
        const second = parts[1];
        if (first && first[0] && second && second[0]) {
          setInitials((first[0] + second[0]).toUpperCase());
        } else if (first) {
          setInitials(first.slice(0, 2).toUpperCase());
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'hi' | 'mr') => {
    setActiveLanguage(newLang);
    try {
      localStorage.setItem('legal_lens_language', newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(new CustomEvent('legal_lens_language_change', { detail: newLang }));
    } catch {
      // Ignore storage errors
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const QUICK_ACTIONS = [
    { label: 'Analyze New Agreement', href: '/analyze', desc: 'Upload PDF or paste legal text' },
    { label: 'Compare Two Documents', href: '/compare', desc: 'Side-by-side clause & risk diff' },
    { label: 'View Risk Dashboard', href: '/dashboard', desc: 'Audit stats & saved agreements' },
    { label: 'Sign In / Account', href: '/login', desc: 'Access your account workspace' },
  ];

  const filteredActions = QUICK_ACTIONS.filter(
    (a) =>
      a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-8 dark:border-slate-800/80 dark:bg-slate-900/95">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3 w-full max-w-lg">
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Search Trigger Button / Input */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex w-full max-w-md items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            <span className="flex-1 text-left text-slate-400 dark:text-slate-400 truncate text-xs">
              Search legal clauses, precedents...
            </span>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3.5">
          {/* Language Switcher Pill: EN HI MR */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800">
            {(['en', 'hi', 'mr'] as const).map((langCode) => {
              const isSelected = activeLanguage === langCode;
              return (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => handleLanguageChange(langCode)}
                  className={`rounded-md px-2 py-1 uppercase transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs font-bold dark:bg-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-label={`Switch language to ${langCode.toUpperCase()}`}
                >
                  {langCode}
                </button>
              );
            })}
          </div>

          <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

          <ThemeToggle />

          {/* User Profile Avatar with JD */}
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white transition-opacity hover:opacity-90 dark:bg-slate-800 dark:border dark:border-slate-700"
            title="User Profile & Settings"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Command Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command, search contracts or features..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Navigation & Tools
              </p>
              {filteredActions.length > 0 ? (
                filteredActions.map((action) => (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(action.href);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{action.label}</div>
                        <div className="text-xs text-slate-400">{action.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching tools or documents found.
                </div>
              )}
            </div>

            <div className="mt-3 border-t border-slate-100 pt-2 text-right text-[11px] text-slate-400 dark:border-slate-800">
              Press <kbd className="rounded border px-1 text-[10px]">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

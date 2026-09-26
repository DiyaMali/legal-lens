'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const saved = localStorage.getItem('legal_lens_theme') as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('legal_lens_theme', next);
    applyTheme(next);
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark mode enabled. Click to switch to system theme.';
    if (theme === 'light') return 'Light mode enabled. Click to switch to dark theme.';
    return 'System theme enabled. Click to switch to light theme.';
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {theme === 'dark' && <span aria-hidden="true" className="text-lg">🌙</span>}
      {theme === 'light' && <span aria-hidden="true" className="text-lg">☀️</span>}
      {theme === 'system' && <span aria-hidden="true" className="text-lg">💻</span>}
    </button>
  );
}

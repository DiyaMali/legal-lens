'use client';

import { useState, useEffect } from 'react';
import { OutputLanguage, LANGUAGE_LABELS, OUTPUT_LANGUAGES } from '@/lib/config';

export function LanguageSwitcher() {
  const [lang, setLang] = useState<OutputLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('legal_lens_language') as OutputLanguage | null;
    if (saved && OUTPUT_LANGUAGES.includes(saved)) {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const handleChange = (newLang: OutputLanguage) => {
    setLang(newLang);
    localStorage.setItem('legal_lens_language', newLang);
    document.documentElement.lang = newLang;
    window.dispatchEvent(new CustomEvent('legal_lens_language_change', { detail: newLang }));
  };

  return (
    <div className="relative inline-block">
      <label htmlFor="language-switcher-select" className="sr-only">
        Select Language
      </label>
      <select
        id="language-switcher-select"
        value={lang}
        onChange={(e) => handleChange(e.target.value as OutputLanguage)}
        aria-label="Select language / भाषा निवडा / भाषा चुनें"
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {OUTPUT_LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code}>
            {LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}

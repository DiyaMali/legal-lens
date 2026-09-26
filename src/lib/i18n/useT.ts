'use client';

import { useState, useEffect, useCallback } from 'react';
import { Locale, SUPPORTED_LOCALES } from './languages';
import en from './dictionaries/en.json';
import hi from './dictionaries/hi.json';
import mr from './dictionaries/mr.json';

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  en,
  hi,
  mr,
};

export function useT() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('legal_lens_language') as Locale | null;
      if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }

    const handleLangChange = (e: Event) => {
      const customEvt = e as CustomEvent<Locale>;
      if (customEvt.detail && (SUPPORTED_LOCALES as readonly string[]).includes(customEvt.detail)) {
        setLocaleState(customEvt.detail);
      }
    };

    window.addEventListener('legal_lens_language_change', handleLangChange);
    return () => {
      window.removeEventListener('legal_lens_language_change', handleLangChange);
    };
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('legal_lens_language', newLocale);
      document.documentElement.lang = newLocale;
      window.dispatchEvent(
        new CustomEvent('legal_lens_language_change', { detail: newLocale }),
      );
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = DICTIONARIES[locale] || DICTIONARIES.en;
      if (dict[key]) {
        return dict[key];
      }
      if (DICTIONARIES.en[key]) {
        return DICTIONARIES.en[key];
      }
      return fallback || key;
    },
    [locale],
  );

  return { t, locale, setLocale };
}

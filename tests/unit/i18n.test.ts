import { describe, it, expect } from 'vitest';
import en from '@/lib/i18n/dictionaries/en.json';
import hi from '@/lib/i18n/dictionaries/hi.json';
import mr from '@/lib/i18n/dictionaries/mr.json';
import { SUPPORTED_LOCALES, LANGUAGE_METADATA } from '@/lib/i18n/languages';

describe('i18n Key Parity & Integrity', () => {
  const enKeys = Object.keys(en).sort();
  const hiKeys = Object.keys(hi).sort();
  const mrKeys = Object.keys(mr).sort();

  it('has identical keys between English and Hindi dictionaries', () => {
    expect(hiKeys).toEqual(enKeys);
  });

  it('has identical keys between English and Marathi dictionaries', () => {
    expect(mrKeys).toEqual(enKeys);
  });

  it('contains no empty strings in English dictionary', () => {
    for (const [key, val] of Object.entries(en)) {
      expect(val.trim().length, `Key "${key}" in en.json should not be empty`).toBeGreaterThan(0);
    }
  });

  it('contains no empty strings in Hindi dictionary', () => {
    for (const [key, val] of Object.entries(hi)) {
      expect(val.trim().length, `Key "${key}" in hi.json should not be empty`).toBeGreaterThan(0);
    }
  });

  it('contains no empty strings in Marathi dictionary', () => {
    for (const [key, val] of Object.entries(mr)) {
      expect(val.trim().length, `Key "${key}" in mr.json should not be empty`).toBeGreaterThan(0);
    }
  });

  it('has valid metadata for every supported locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const meta = LANGUAGE_METADATA[locale];
      expect(meta).toBeDefined();
      expect(meta.code).toBe(locale);
      expect(meta.label).toBeTruthy();
      expect(meta.nativeLabel).toBeTruthy();
      expect(['latin', 'devanagari']).toContain(meta.script);
    }
  });
});

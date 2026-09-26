export const SUPPORTED_LOCALES = ['en', 'hi', 'mr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface LanguageInfo {
  code: Locale;
  label: string;
  nativeLabel: string;
  script: 'latin' | 'devanagari';
  direction: 'ltr';
}

export const LANGUAGE_METADATA: Record<Locale, LanguageInfo> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    script: 'latin',
    direction: 'ltr',
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    script: 'devanagari',
    direction: 'ltr',
  },
  mr: {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    script: 'devanagari',
    direction: 'ltr',
  },
};

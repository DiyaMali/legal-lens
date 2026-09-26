/**
 * Web Speech API Voice matching helpers for English, Hindi, and Marathi.
 */

import { OutputLanguage } from '@/lib/config';

export function getVoiceForLanguage(lang: OutputLanguage): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langCodePrefixMap: Record<OutputLanguage, string[]> = {
    en: ['en-IN', 'en-GB', 'en-US', 'en'],
    hi: ['hi-IN', 'hi', 'hin'],
    mr: ['mr-IN', 'mr', 'mar', 'hi-IN'], // fallback to Hindi if Marathi voice is not installed
  };

  const preferences = langCodePrefixMap[lang] || ['en'];

  for (const pref of preferences) {
    const found = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(pref.toLowerCase()) ||
        v.lang.toLowerCase().replace('_', '-').startsWith(pref.toLowerCase()),
    );
    if (found) return found;
  }

  // Fallback to default voice or first available
  return voices.find((v) => v.default) || voices[0] || null;
}

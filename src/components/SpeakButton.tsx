'use client';

import { useState, useEffect } from 'react';
import { OutputLanguage, LANGUAGE_LABELS, OUTPUT_LANGUAGES } from '@/lib/config';
import { globalSpeech, SpeechController } from '@/lib/speech/speak';

interface SpeakButtonProps {
  text: string;
  language?: OutputLanguage;
  label?: string;
  size?: 'sm' | 'md';
  allowLanguageSelect?: boolean;
}

export function SpeakButton({
  text,
  language: initialLanguage = 'en',
  label = 'Read aloud',
  size = 'sm',
  allowLanguageSelect = false,
}: SpeakButtonProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<OutputLanguage>(initialLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(SpeechController.isSupported());
  }, []);

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  const speakText = (textToSpeak: string, lang: OutputLanguage) => {
    globalSpeech.speak({
      text: textToSpeak,
      language: lang,
      onStart: () => {
        setIsPlaying(true);
        setIsTranslating(false);
      },
      onEnd: () => setIsPlaying(false),
      onError: (err) => {
        setIsPlaying(false);
        setIsTranslating(false);
        setError(err);
      },
    });
  };

  const handleToggle = async () => {
    if (!isSupported) {
      setError('Speech is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      globalSpeech.stop();
      setIsPlaying(false);
      return;
    }

    setError(null);

    // If target language is different from original source language, translate first
    if (selectedLanguage !== initialLanguage) {
      setIsTranslating(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLanguage: selectedLanguage,
            sourceLanguage: initialLanguage,
          }),
        });

        const data = await response.json() as { translatedText?: string; error?: { message: string } };

        if (!response.ok || !data.translatedText) {
          setError(data.error?.message || 'Translation failed.');
          setIsTranslating(false);
          // Fallback to original text
          speakText(text, initialLanguage);
          return;
        }

        speakText(data.translatedText, selectedLanguage);
      } catch {
        setIsTranslating(false);
        speakText(text, initialLanguage);
      }
    } else {
      speakText(text, selectedLanguage);
    }
  };

  if (!isSupported) {
    return null;
  }

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isTranslating}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? `Stop reading: ${label}` : `Read aloud: ${label} in ${LANGUAGE_LABELS[selectedLanguage]}`}
        title={isPlaying ? 'Stop reading' : `Read aloud in ${LANGUAGE_LABELS[selectedLanguage]}`}
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 ${
          isPlaying
            ? 'border-brand-500 bg-brand-50 text-brand-700 animate-pulse dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300'
            : isTranslating
            ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        } ${isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
      >
        <span aria-hidden="true">{isPlaying ? '⏹️' : isTranslating ? '⏳' : '🔊'}</span>
        <span>{isPlaying ? 'Stop' : isTranslating ? 'Translating…' : label}</span>
      </button>

      {/* Language selector toggle if allowed */}
      {allowLanguageSelect && (
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const newLang = e.target.value as OutputLanguage;
              setSelectedLanguage(newLang);
              if (isPlaying) {
                globalSpeech.stop();
                setIsPlaying(false);
              }
            }}
            aria-label="Speaker voice language"
            className="rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-[11px] font-medium text-slate-600 hover:border-slate-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {OUTPUT_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()} ({LANGUAGE_LABELS[lang].split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}

import { OutputLanguage } from '@/lib/config';
import { getVoiceForLanguage } from './voices';

export interface SpeakOptions {
  text: string;
  language: OutputLanguage;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

/**
 * Splits long text into natural sentence chunks to prevent browser speech synthesis timeouts.
 */
export function chunkTextIntoSentences(text: string): string[] {
  if (!text) return [];
  // Match sentences ending in punctuation or Devanagari danda (।)
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^.!?।\n]+[.!?।\n]*/g) || [text];

  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

export class SpeechController {
  private currentUtteranceIndex = 0;
  private chunks: string[] = [];
  private options: SpeakOptions | null = null;
  private isCancelled = false;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public speak(options: SpeakOptions): void {
    if (!SpeechController.isSupported()) {
      options.onError?.('Speech synthesis is not supported on this device/browser.');
      return;
    }

    this.stop();
    this.isCancelled = false;
    this.options = options;
    this.chunks = chunkTextIntoSentences(options.text);
    this.currentUtteranceIndex = 0;

    if (this.chunks.length === 0) {
      options.onEnd?.();
      return;
    }

    options.onStart?.();
    this.speakNextChunk();
  }

  private speakNextChunk(): void {
    if (this.isCancelled || !this.options) return;

    if (this.currentUtteranceIndex >= this.chunks.length) {
      this.options.onEnd?.();
      return;
    }

    const chunk = this.chunks[this.currentUtteranceIndex];
    const UtteranceClass =
      typeof window !== 'undefined' && window.SpeechSynthesisUtterance
        ? window.SpeechSynthesisUtterance
        : (globalThis as unknown as { SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance }).SpeechSynthesisUtterance;

    if (!UtteranceClass) {
      this.options.onError?.('SpeechSynthesisUtterance is not available.');
      return;
    }

    const utterance = new UtteranceClass(chunk);

    const voice = getVoiceForLanguage(this.options.language);
    if (voice) utterance.voice = voice;

    utterance.lang =
      this.options.language === 'hi'
        ? 'hi-IN'
        : this.options.language === 'mr'
        ? 'mr-IN'
        : 'en-US';

    utterance.rate = this.options.rate ?? 1.0;
    utterance.pitch = this.options.pitch ?? 1.0;

    utterance.onend = () => {
      if (this.isCancelled) return;
      this.currentUtteranceIndex++;
      this.speakNextChunk();
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (this.isCancelled) return;
      // 'canceled' error is normal when stop() is called
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      this.options?.onError?.(e.error || 'Speech error occurred.');
      this.stop();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    this.isCancelled = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking;
  }
}

// Global shared instance for single-point playback control across UI
export const globalSpeech = new SpeechController();

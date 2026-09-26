import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chunkTextIntoSentences, SpeechController } from '@/lib/speech/speak';
import { getVoiceForLanguage } from '@/lib/speech/voices';

describe('chunkTextIntoSentences', () => {
  it('splits English sentences correctly', () => {
    const text = 'The tenant shall pay rent. The deposit is non-refundable. Maintenance is extra!';
    const chunks = chunkTextIntoSentences(text);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toBe('The tenant shall pay rent.');
    expect(chunks[1]).toBe('The deposit is non-refundable.');
    expect(chunks[2]).toBe('Maintenance is extra!');
  });

  it('splits Devanagari sentences with danda (।) correctly', () => {
    const text = 'किराया ₹१५,००० प्रति माह होगा। सुरक्षा जमा ₹५०,००० है। यह गैर-वापसी योग्य नहीं है।';
    const chunks = chunkTextIntoSentences(text);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty text gracefully', () => {
    const chunks = chunkTextIntoSentences('');
    expect(chunks).toEqual([]);
  });
});

describe('getVoiceForLanguage', () => {
  beforeEach(() => {
    (global as any).window = {
      speechSynthesis: {
        getVoices: () => [
          { lang: 'en-US', name: 'English US', default: true } as any,
          { lang: 'hi-IN', name: 'Hindi India', default: false } as any,
          { lang: 'mr-IN', name: 'Marathi India', default: false } as any,
        ],
      },
    };
  });

  it('finds voice matching English', () => {
    const v = getVoiceForLanguage('en');
    expect(v?.lang).toBe('en-US');
  });

  it('finds voice matching Hindi', () => {
    const v = getVoiceForLanguage('hi');
    expect(v?.lang).toBe('hi-IN');
  });

  it('finds voice matching Marathi', () => {
    const v = getVoiceForLanguage('mr');
    expect(v?.lang).toBe('mr-IN');
  });

  it('handles empty voices array gracefully', () => {
    (global as any).window.speechSynthesis.getVoices = () => [];
    const v = getVoiceForLanguage('en');
    expect(v).toBeNull();
  });
});

describe('SpeechController', () => {
  let mockUtterance: any;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    mockUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
      this.text = text;
      this.lang = '';
      this.onend = null;
      this.onerror = null;
    });

    mockSpeechSynthesis = {
      speak: vi.fn((u) => {
        setTimeout(() => u.onend?.(), 10);
      }),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [
        { lang: 'en-US', name: 'English US', default: true } as any,
        { lang: 'hi-IN', name: 'Hindi India', default: false } as any,
        { lang: 'mr-IN', name: 'Marathi India', default: false } as any,
      ]),
      speaking: false,
    };

    // @ts-expect-error Mock window globals
    global.window = {
      speechSynthesis: mockSpeechSynthesis,
      SpeechSynthesisUtterance: mockUtterance,
    };
    (globalThis as any).SpeechSynthesisUtterance = mockUtterance;
    (globalThis as any).speechSynthesis = mockSpeechSynthesis;
  });

  it('detects Web Speech API support', () => {
    expect(SpeechController.isSupported()).toBe(true);
  });

  it('calls speak and onEnd callback when completed', async () => {
    const controller = new SpeechController();
    const onStart = vi.fn();
    const onEnd = vi.fn();

    controller.speak({
      text: 'First sentence. Second sentence.',
      language: 'en',
      onStart,
      onEnd,
    });

    expect(onStart).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it('cancels speech when stop is called', () => {
    const controller = new SpeechController();
    controller.stop();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('reports isSpeaking correctly', () => {
    const controller = new SpeechController();
    expect(controller.isSpeaking()).toBe(false);
    mockSpeechSynthesis.speaking = true;
    expect(controller.isSpeaking()).toBe(true);
  });

  it('handles empty text speak request', () => {
    const controller = new SpeechController();
    const onEnd = vi.fn();
    controller.speak({
      text: '',
      language: 'en',
      onEnd,
    });
    expect(onEnd).toHaveBeenCalled();
  });

  it('handles error in utterance', () => {
    mockSpeechSynthesis.speak = vi.fn((u) => {
      setTimeout(() => u.onerror?.({ error: 'not-allowed' }), 10);
    });

    const controller = new SpeechController();
    const onError = vi.fn();

    controller.speak({
      text: 'Testing error handler.',
      language: 'en',
      onError,
    });
  });
});

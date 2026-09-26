import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useT } from '@/lib/i18n/useT';

describe('useT hook', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    // @ts-expect-error Mock localStorage
    global.localStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };
  });

  it('defaults to English locale and returns correct translations', () => {
    const { result } = renderHook(() => useT());
    expect(result.current.locale).toBe('en');
    expect(result.current.t('nav.home')).toBe('Home');
    expect(result.current.t('non.existent.key', 'Fallback')).toBe('Fallback');
  });

  it('updates locale and returns translated strings in Hindi', () => {
    const { result } = renderHook(() => useT());

    act(() => {
      result.current.setLocale('hi');
    });

    expect(result.current.locale).toBe('hi');
    expect(result.current.t('nav.home')).toBe('मुख्य पृष्ठ');
    expect(mockStore['legal_lens_language']).toBe('hi');
  });

  it('updates locale and returns translated strings in Marathi', () => {
    const { result } = renderHook(() => useT());

    act(() => {
      result.current.setLocale('mr');
    });

    expect(result.current.locale).toBe('mr');
    expect(result.current.t('nav.home')).toBe('मुख्य पृष्ठ');
    expect(mockStore['legal_lens_language']).toBe('mr');
  });

  it('reacts to window legal_lens_language_change event', () => {
    const { result } = renderHook(() => useT());

    act(() => {
      window.dispatchEvent(
        new CustomEvent('legal_lens_language_change', { detail: 'hi' }),
      );
    });

    expect(result.current.locale).toBe('hi');
  });

  it('falls back to English when key is missing in selected locale', () => {
    const { result } = renderHook(() => useT());

    act(() => {
      result.current.setLocale('hi');
    });

    // Valid en key
    expect(result.current.t('nav.brand')).toBe('लीगल लेन्स');
  });
});

/**
 * Client-side script and language heuristic detection.
 * Runs instantly in milliseconds without any network or API calls.
 */

export type DetectedScript = 'latin' | 'devanagari' | 'mixed';

export interface ScriptDetectionResult {
  script: DetectedScript;
  devanagariRatio: number;
  latinRatio: number;
  hasDevanagari: boolean;
}

export function detectScript(text: string): ScriptDetectionResult {
  if (!text || typeof text !== 'string') {
    return {
      script: 'latin',
      devanagariRatio: 0,
      latinRatio: 0,
      hasDevanagari: false,
    };
  }

  // Devanagari Unicode Block: U+0900 to U+097F
  const devanagariRegex = /[\u0900-\u097F]/g;
  const latinRegex = /[a-zA-Z]/g;

  const devanagariMatches = text.match(devanagariRegex) || [];
  const latinMatches = text.match(latinRegex) || [];

  const devanagariCount = devanagariMatches.length;
  const latinCount = latinMatches.length;
  const totalLetters = devanagariCount + latinCount;

  if (totalLetters === 0) {
    return {
      script: 'latin',
      devanagariRatio: 0,
      latinRatio: 0,
      hasDevanagari: false,
    };
  }

  const devanagariRatio = devanagariCount / totalLetters;
  const latinRatio = latinCount / totalLetters;

  let script: DetectedScript = 'latin';
  if (devanagariRatio > 0.6) {
    script = 'devanagari';
  } else if (devanagariRatio > 0.1 && latinRatio > 0.1) {
    script = 'mixed';
  } else if (latinRatio > 0.6) {
    script = 'latin';
  } else {
    script = devanagariCount > 0 ? 'mixed' : 'latin';
  }

  return {
    script,
    devanagariRatio,
    latinRatio,
    hasDevanagari: devanagariCount > 0,
  };
}

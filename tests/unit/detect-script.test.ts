import { describe, it, expect } from 'vitest';
import { detectScript } from '@/lib/language/detect-script';

describe('detectScript', () => {
  it('detects pure English / Latin script', () => {
    const res = detectScript('This is a residential rental agreement between landlord and tenant.');
    expect(res.script).toBe('latin');
    expect(res.hasDevanagari).toBe(false);
    expect(res.latinRatio).toBe(1);
  });

  it('detects pure Devanagari script (Hindi)', () => {
    const res = detectScript('यह मकान मालिक और किरायेदार के बीच एक किराया समझौता है।');
    expect(res.script).toBe('devanagari');
    expect(res.hasDevanagari).toBe(true);
    expect(res.devanagariRatio).toBe(1);
  });

  it('detects pure Devanagari script (Marathi)', () => {
    const res = detectScript('हा घरमालक आणि भाडेकरू यांच्यातील भाडेकरार आहे.');
    expect(res.script).toBe('devanagari');
    expect(res.hasDevanagari).toBe(true);
    expect(res.devanagariRatio).toBe(1);
  });

  it('detects mixed script', () => {
    const res = detectScript('Clause 1: सुरक्षा ठेव (Security Deposit) ₹50,000 असेल.');
    expect(res.script).toBe('mixed');
    expect(res.hasDevanagari).toBe(true);
    expect(res.devanagariRatio).toBeGreaterThan(0.1);
    expect(res.latinRatio).toBeGreaterThan(0.1);
  });

  it('handles empty and whitespace strings gracefully', () => {
    const res1 = detectScript('');
    expect(res1.script).toBe('latin');
    expect(res1.hasDevanagari).toBe(false);

    const res2 = detectScript('   12345 !@#$%   ');
    expect(res2.script).toBe('latin');
    expect(res2.hasDevanagari).toBe(false);
  });
});

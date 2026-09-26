import { describe, it, expect } from 'vitest';
import { DOCUMENT_CHECKLISTS, getChecklistText } from '@/lib/doc-types';
import { DOCUMENT_TYPES } from '@/lib/config';

describe('doc-types module', () => {
  it('has checklists for all supported document types', () => {
    for (const type of DOCUMENT_TYPES) {
      expect(DOCUMENT_CHECKLISTS[type]).toBeDefined();
      expect(DOCUMENT_CHECKLISTS[type].length).toBeGreaterThan(0);
      for (const item of DOCUMENT_CHECKLISTS[type]) {
        expect(item.name).toBeTruthy();
        expect(item.whyItMatters).toBeTruthy();
      }
    }
  });

  it('formats checklist text correctly', () => {
    for (const type of DOCUMENT_TYPES) {
      const text = getChecklistText(type);
      expect(text).toContain('1. ');
      expect(text).toContain(': ');
      expect(text.split('\n').length).toBe(DOCUMENT_CHECKLISTS[type].length);
    }
  });
});

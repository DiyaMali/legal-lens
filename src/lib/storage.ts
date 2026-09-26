'use client';

import { AnalysisResult } from './schemas/analyze';
import {
  HistoryItem,
  HistoryListSchema,
  UserProfile,
  UserProfileSchema,
} from './schemas/storage';
import { DocumentType, OutputLanguage } from './config';

const HISTORY_KEY = 'legal_lens_history';
const PROFILE_KEY = 'legal_lens_profile';
const MAX_HISTORY_ITEMS = 20;

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = HistoryListSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return [];
  } catch {
    return [];
  }
}

export function getHistoryItemById(id: string): HistoryItem | null {
  const list = getHistory();
  return list.find((item) => item.id === id) || null;
}

export function saveAnalysisToHistory({
  result,
  documentType,
  language,
}: {
  result: AnalysisResult;
  documentType: DocumentType;
  language: OutputLanguage;
}): HistoryItem | null {
  if (typeof window === 'undefined') return null;

  try {
    const history = getHistory();

    const lowCount = result.clauses.filter((c) => c.riskLevel === 'low').length;
    const medCount = result.clauses.filter((c) => c.riskLevel === 'medium').length;
    const highCount = result.clauses.filter((c) => c.riskLevel === 'high').length;

    // Generate title from result or docType
    const title =
      result.clauses[0]?.title ||
      `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Agreement`;

    const newItem: HistoryItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `doc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      documentType,
      language,
      result,
      riskSummary: {
        low: lowCount,
        medium: medCount,
        high: highCount,
      },
    };

    // Prepend new item and cap to MAX_HISTORY_ITEMS
    const updated = [newItem, ...history.filter((h) => h.id !== newItem.id)].slice(
      0,
      MAX_HISTORY_ITEMS,
    );

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.error('Failed to save to history:', err);
    return null;
  }
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      name: 'Legal Lens User',
      role: 'Tenant',
      notes: '',
      jurisdiction: 'India',
    };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return {
        name: 'Legal Lens User',
        role: 'Tenant',
        notes: '',
        jurisdiction: 'India',
      };
    }
    const parsed = JSON.parse(raw);
    const result = UserProfileSchema.safeParse(parsed);
    if (result.success) return result.data;
    return {
      name: 'Legal Lens User',
      role: 'Tenant',
      notes: '',
      jurisdiction: 'India',
    };
  } catch {
    return {
      name: 'Legal Lens User',
      role: 'Tenant',
      notes: '',
      jurisdiction: 'India',
    };
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

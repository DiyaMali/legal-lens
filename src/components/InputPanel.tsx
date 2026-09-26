'use client';

/**
 * InputPanel — the document input form (F1).
 *
 * Supports:
 * - Drag-and-drop file upload (PDF/TXT)
 * - File button (real <input type="file"> for a11y)
 * - Textarea for pasted text
 * - Document type selector
 * - Output language selector
 *
 * Accessibility:
 * - All inputs have visible labels
 * - Errors use role="alert" and are linked with aria-describedby
 * - Dropzone is keyboard-operable (the real file input handles this)
 * - Loading state announced via aria-live
 */

import { useState, useRef, useCallback, useId } from 'react';
import { DocumentType, OutputLanguage, OUTPUT_LANGUAGES, LANGUAGE_LABELS, PRIVACY_NOTE, MAX_TEXT_CHARS } from '@/lib/config';
import { USER_ERROR_MESSAGES } from '@/lib/errors';
import { Disclaimer } from './Disclaimer';
import { CaseCategorySelector, CASE_CATEGORIES } from './CaseCategorySelector';

interface InputPanelProps {
  onSubmit: (data: {
    text: string;
    docType: DocumentType;
    language: OutputLanguage;
  }) => void;
  isLoading: boolean;
  initialText?: string;
  initialDocType?: DocumentType;
  initialFileName?: string | null;
}

export function InputPanel({
  onSubmit,
  isLoading,
  initialText = '',
  initialDocType = 'rental',
  initialFileName = null,
}: InputPanelProps) {
  const [text, setText] = useState(initialText);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    const match = CASE_CATEGORIES.find(c => c.docType === initialDocType);
    return match ? match.id : 'property';
  });
  const [docType, setDocType] = useState<DocumentType>(initialDocType);
  const [language, setLanguage] = useState<OutputLanguage>('en');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(initialFileName);
  const [isExtracting, setIsExtracting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const textAreaId = useId();
  const languageId = useId();
  const statusId = useId();

  const clearError = () => setError(null);

  const handleFileUpload = useCallback(async (file: File) => {
    clearError();
    setIsExtracting(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as { text?: string; charCount?: number; error?: { code: string; message: string } };

      if (!response.ok || data.error) {
        const code = data.error?.code ?? 'INTERNAL_ERROR';
        setError(USER_ERROR_MESSAGES[code as keyof typeof USER_ERROR_MESSAGES] ?? data.error?.message ?? 'Upload failed.');
        setUploadedFileName(null);
        return;
      }

      if (data.text) {
        setText(data.text);
      }
    } catch {
      setError('Failed to upload file. Please check your connection and try again.');
      setUploadedFileName(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFileUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please upload a file or paste the document text before analysing.');
      return;
    }
    if (trimmed.length > MAX_TEXT_CHARS) {
      setError(USER_ERROR_MESSAGES.TEXT_TOO_LONG);
      return;
    }

    onSubmit({ text: trimmed, docType, language });
  };

  const charCount = text.trim().length;
  const charPercent = Math.min(100, (charCount / MAX_TEXT_CHARS) * 100);

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Document analysis form">
      {/* Error announcement */}
      {error && (
        <div
          role="alert"
          id={errorId}
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="font-semibold">Error: </span>
          {error}
        </div>
      )}

      {/* Status announcements for screen readers */}
      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isExtracting && 'Extracting text from file, please wait.'}
        {isLoading && 'Analysing document with AI, please wait.'}
      </div>

      {/* File dropzone */}
      <div className="mb-4">
        <div
          role="group"
          aria-label="File upload area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-300 bg-slate-50 hover:border-brand-300'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl" aria-hidden="true">
              📄
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Drag &amp; drop your PDF, TXT, or document image here
              </p>
              <p className="mt-1 text-xs text-slate-500">or</p>
            </div>
            {/* Visible label linked to the real file input */}
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2"
            >
              Choose file
              <input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-describedby={error ? errorId : undefined}
              />
            </label>
            <p className="text-xs text-slate-400">PDF, TXT, PNG, JPG, WebP · max 4 MB</p>
            {uploadedFileName && (
              <p className="text-xs font-medium text-brand-600">✓ {uploadedFileName} loaded</p>
            )}
            {isExtracting && (
              <p className="text-xs text-slate-500">Extracting text…</p>
            )}
          </div>
        </div>
      </div>

      {/* Text divider */}
      <div className="mb-4 flex items-center gap-3">
        <hr className="flex-1 border-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR PASTE TEXT BELOW</span>
        <hr className="flex-1 border-slate-200" />
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <label htmlFor={textAreaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          Document text
        </label>
        <textarea
          id={textAreaId}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            clearError();
          }}
          placeholder="Paste the full text of the legal document here…"
          rows={10}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          aria-describedby={`${textAreaId}-count${error ? ` ${errorId}` : ''}`}
        />
        {/* Character count indicator */}
        <div id={`${textAreaId}-count`} className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {charCount.toLocaleString()} / {MAX_TEXT_CHARS.toLocaleString()} characters
          </span>
          {charPercent > 80 && (
            <span className={`text-xs font-medium ${charPercent >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
              {charPercent >= 100 ? 'Too long — max reached' : 'Approaching limit'}
            </span>
          )}
        </div>
      </div>

      {/* Case Category Square Grid Selection */}
      <div className="mb-6">
        <CaseCategorySelector
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(cat) => {
            setSelectedCategoryId(cat.id);
            setDocType(cat.docType);
          }}
        />
      </div>

      {/* Language Selector */}
      <div className="mb-6">
        <label htmlFor={languageId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Explanation Language
        </label>
        <div className="grid grid-cols-3 gap-2">
          {OUTPUT_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                language === lang
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <p className="mb-4 text-xs text-slate-400">{PRIVACY_NOTE}</p>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || isExtracting || charCount === 0}
        aria-busy={isLoading}
        className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Analysing…' : isExtracting ? 'Reading file…' : 'Analyse Document'}
      </button>

      {/* Disclaimer */}
      <div className="mt-4">
        <Disclaimer variant="inline" />
      </div>
    </form>
  );
}

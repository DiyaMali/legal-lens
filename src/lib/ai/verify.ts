/**
 * Quote verification for AI-generated clause citations.
 *
 * WHY: The model may hallucinate quotes or slightly paraphrase text.
 * Our verification step independently checks whether the quoted text actually
 * exists in the source document — setting quoteVerified in code, never relying
 * on the model's own claim.
 *
 * Normalization strategy:
 * - Collapse all whitespace (newlines, tabs, multiple spaces → single space)
 * - Normalize Unicode quotation marks to ASCII
 * - Case-insensitive comparison
 * This handles the common cases where the model introduces minor whitespace or
 * punctuation differences without inventing new content.
 */

/**
 * Normalize a string for quote verification:
 * - Trim leading/trailing whitespace
 * - Collapse internal whitespace to single spaces
 * - Normalize Unicode quotes to ASCII equivalents
 * - Lowercase for case-insensitive matching
 */
export function normalizeForVerification(text: string): string {
  return text
    .trim()
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes → straight
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes → straight
    .replace(/[\u2013\u2014]/g, '-') // en/em dash → hyphen
    .replace(/\s+/g, ' ')           // collapse whitespace
    .toLowerCase();
}

/**
 * Verify that a quote from the model actually exists in the source document.
 *
 * @param document - The full source document text
 * @param quote - The quote the model claims to have extracted
 * @returns true if the normalized quote is a substring of the normalized document
 */
export function verifyQuote(document: string, quote: string): boolean {
  if (!quote || !document) return false;

  // Minimum quote length to avoid trivial matches on very short strings
  const normalized = normalizeForVerification(quote);
  if (normalized.length < 10) return false;

  const normalizedDoc = normalizeForVerification(document);
  return normalizedDoc.includes(normalized);
}

/**
 * Run verification on an array of quotes and return a parallel boolean array.
 * Useful for batch-verifying all clause quotes in one pass.
 */
export function verifyQuotes(document: string, quotes: string[]): boolean[] {
  const normalizedDoc = normalizeForVerification(document);
  return quotes.map((quote) => {
    const normalized = normalizeForVerification(quote);
    return normalized.length >= 10 && normalizedDoc.includes(normalized);
  });
}

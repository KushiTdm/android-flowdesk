// ---------------------------------------------------------------------------
// sanitize.utils.ts — Input sanitization and text cleaning helpers
// ---------------------------------------------------------------------------

const INTENT_BLOCK_REGEX = /```intent[\s\S]*?```/g;

/** Removes the ```intent...``` block from an AI response string */
export function stripIntentBlock(text: string): string {
  return text.replace(INTENT_BLOCK_REGEX, '').trim();
}

/** Truncates text to maxLen characters, appending "…" if cut */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

/** Trims whitespace and enforces a maximum length of 1000 characters */
export function sanitizeInput(text: string): string {
  return truncate(text.trim(), 1000);
}

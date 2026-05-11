// ---------------------------------------------------------------------------
// gemini.service.ts — Gemini v1beta streaming chat + key validation
// ---------------------------------------------------------------------------

import { GeminiError } from '../utils/error.utils';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiChunk {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function throwOnError(response: Response): Promise<void> {
  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      // ignore
    }
    throw new GeminiError(`Gemini HTTP ${response.status}: ${body}`, response.status);
  }
}

function extractToken(chunk: GeminiChunk): string {
  return chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ---------------------------------------------------------------------------
// GeminiService
// ---------------------------------------------------------------------------

export const GeminiService = {
  /**
   * Streams a chat response token by token.
   * Yields each text token as it arrives.
   * Returns the full accumulated text when the stream ends.
   */
  async *chatStream(
    apiKey: string,
    model: string,
    messages: GeminiMessage[],
    systemPrompt?: string,
    signal?: AbortSignal,
  ): AsyncGenerator<string, string, unknown> {
    const effectiveSignal = signal ?? AbortSignal.timeout(15_000);

    const url = `${BASE_URL}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const body: Record<string, unknown> = {
      contents: messages,
    };

    if (systemPrompt) {
      body['system_instruction'] = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: effectiveSignal,
    });

    await throwOnError(response);

    const reader = response.body?.getReader();
    if (!reader) throw new GeminiError('No response body', 500);

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice('data:'.length).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const chunk = JSON.parse(jsonStr) as GeminiChunk;
            const token = extractToken(chunk);
            if (token) {
              fullText += token;
              yield token;
            }
          } catch {
            // Malformed JSON chunk — skip silently
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim().startsWith('data:')) {
        const jsonStr = buffer.trim().slice('data:'.length).trim();
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            const chunk = JSON.parse(jsonStr) as GeminiChunk;
            const token = extractToken(chunk);
            if (token) {
              fullText += token;
              yield token;
            }
          } catch {
            // ignore
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  },

  /**
   * Lightweight key validation — lists available models.
   * Returns true if the key is valid.
   */
  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/models?key=${apiKey}`, {
        signal: AbortSignal.timeout(5_000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

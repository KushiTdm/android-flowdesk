// ---------------------------------------------------------------------------
// error.utils.ts — Typed error classes + user-facing message mapper (French)
// ---------------------------------------------------------------------------

export class GeminiError extends Error {
  constructor(msg: string, public statusCode: number) {
    super(msg);
    this.name = 'GeminiError';
  }
}

export class AirtableError extends Error {
  constructor(msg: string, public code: string | number) {
    super(msg);
    this.name = 'AirtableError';
  }
}

export class SupabaseError extends Error {
  constructor(msg: string, public code: string) {
    super(msg);
    this.name = 'SupabaseError';
  }
}

export class CalendarError extends Error {
  constructor(msg: string, public statusCode: number) {
    super(msg);
    this.name = 'CalendarError';
  }
}

/**
 * Maps technical errors to French user-facing messages.
 * Never exposes internal details (stack, raw message, credential values).
 */
export function getUserFacingError(error: unknown): string {
  if (error instanceof GeminiError) {
    if (error.statusCode === 401) return 'Clé Gemini invalide. Vérifiez vos paramètres.';
    if (error.statusCode === 429) return 'Quota Gemini atteint. Réessayez dans quelques minutes.';
    return "Erreur de l'assistant IA. Réessayez.";
  }

  if (error instanceof AirtableError) {
    return 'Erreur de synchronisation Airtable. Vérifiez vos credentials.';
  }

  if (error instanceof SupabaseError) {
    return 'Erreur de synchronisation Supabase.';
  }

  if (error instanceof CalendarError) {
    if (error.statusCode === 401) return 'Session Google expirée. Reconnectez votre compte.';
    return 'Erreur Google Agenda. Réessayez.';
  }

  return 'Une erreur inattendue est survenue.';
}

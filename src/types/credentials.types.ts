export interface AppCredentials {
  geminiApiKey?:      string;
  geminiModel?:       string;
  airtableApiKey?:    string;
  airtableBaseId?:    string;
  airtableTableId?:   string;
  supabaseUrl?:       string;
  supabaseAnonKey?:   string;
  googleAccessToken?:  string | null;
  googleRefreshToken?: string | null;
  googleTokenExpiry?:  number | null;
}

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash-lite',  label: 'Gemini 2.5 Flash Lite',  description: 'Rapide, idéal pour le quotidien (défaut)' },
  { id: 'gemini-2.5-flash',       label: 'Gemini 2.5 Flash',       description: 'Puissant et équilibré' },
  { id: 'gemini-2.0-flash',       label: 'Gemini 2.0 Flash',       description: 'Génération précédente' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];
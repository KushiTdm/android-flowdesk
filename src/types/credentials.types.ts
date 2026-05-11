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
  { id: 'gemini-2.0-flash',  label: 'Gemini 2.0 Flash',  description: 'Rapide, idéal pour le quotidien' },
  { id: 'gemini-1.5-pro',    label: 'Gemini 1.5 Pro',    description: 'Plus puissant, contexte long' },
  { id: 'gemini-1.5-flash',  label: 'Gemini 1.5 Flash',  description: 'Équilibre vitesse/qualité' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

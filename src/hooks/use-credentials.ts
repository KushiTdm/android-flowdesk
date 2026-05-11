// ---------------------------------------------------------------------------
// use-credentials.ts — Convenience hook wrapping credentials store
// ---------------------------------------------------------------------------

import { useCredentialsStore } from '../store/credentials.store';

export function useCredentials() {
  const store = useCredentialsStore();

  return {
    credentials: store.credentials,
    isLoaded: store.isLoaded,
    setCredentials: store.setCredentials,
    clearCredentials: store.clearCredentials,
    hasGemini: !!store.credentials.geminiApiKey,
    hasAirtable: !!(
      store.credentials.airtableApiKey && store.credentials.airtableBaseId
    ),
    hasSupabase: !!(
      store.credentials.supabaseUrl && store.credentials.supabaseAnonKey
    ),
    hasGoogle: !!store.credentials.googleAccessToken,
  };
}

// ---------------------------------------------------------------------------
// secure-storage.service.ts — AES-encrypted credential persistence
// ---------------------------------------------------------------------------

import * as SecureStore from 'expo-secure-store';
import type { AppCredentials } from '../types/credentials.types';

const CREDENTIALS_KEY = 'fd_credentials_v1';

export const SecureStorageService = {
  /** Merges partial credentials into the stored blob and persists */
  async saveCredentials(creds: Partial<AppCredentials>): Promise<void> {
    const existing = await SecureStorageService.loadCredentials();
    const merged = { ...existing, ...creds };
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(merged));
  },

  /** Loads the full credentials blob from SecureStore */
  async loadCredentials(): Promise<Partial<AppCredentials>> {
    try {
      const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Partial<AppCredentials>;
    } catch {
      return {};
    }
  },

  /** Deletes the credentials blob from SecureStore */
  async clearCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  },

  /**
   * Returns a record of which credential keys are present.
   * NEVER returns the actual values — only boolean presence flags.
   */
  async debugStatus(): Promise<Record<keyof AppCredentials, boolean>> {
    const creds = await SecureStorageService.loadCredentials();
    return {
      geminiApiKey:       !!creds.geminiApiKey,
      geminiModel:        !!creds.geminiModel,
      airtableApiKey:     !!creds.airtableApiKey,
      airtableBaseId:     !!creds.airtableBaseId,
      airtableTableId:    !!creds.airtableTableId,
      supabaseUrl:        !!creds.supabaseUrl,
      supabaseAnonKey:    !!creds.supabaseAnonKey,
      googleAccessToken:  !!creds.googleAccessToken,
      googleRefreshToken: !!creds.googleRefreshToken,
      googleTokenExpiry:  creds.googleTokenExpiry != null,
    };
  },
};

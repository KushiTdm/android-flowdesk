// ---------------------------------------------------------------------------
// credentials.store.ts — In-memory mirror of SecureStore credentials
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import type { AppCredentials } from '../types/credentials.types';
import { SecureStorageService } from '../services/secure-storage.service';

interface CredentialsState {
  credentials: Partial<AppCredentials>;
  isLoaded: boolean;
  setCredentials: (c: Partial<AppCredentials>) => Promise<void>;
  loadFromSecureStore: () => Promise<void>;
  clearCredentials: () => Promise<void>;
}

export const useCredentialsStore = create<CredentialsState>()((set, get) => ({
  credentials: {},
  isLoaded: false,

  setCredentials: async (c) => {
    await SecureStorageService.saveCredentials({ ...get().credentials, ...c });
    set((state) => ({ credentials: { ...state.credentials, ...c } }));
  },

  loadFromSecureStore: async () => {
    const creds = await SecureStorageService.loadCredentials();
    set({ credentials: creds, isLoaded: true });
  },

  clearCredentials: async () => {
    await SecureStorageService.clearCredentials();
    set({ credentials: {}, isLoaded: true });
  },
}));

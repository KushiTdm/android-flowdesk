// ---------------------------------------------------------------------------
// chat.store.ts — Conversation history with persistence
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AIIntent, ChatMessage } from '../types/ai-intent.types';

interface ChatState {
  messages: ChatMessage[];
  selectedModel: string;
  isStreaming: boolean;
  pendingIntent: AIIntent | null;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (patch: Partial<ChatMessage>) => void;
  setStreaming: (v: boolean) => void;
  setModel: (model: string) => void;
  clearHistory: () => void;
  setPendingIntent: (intent: AIIntent | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      selectedModel: 'gemini-2.5-flash-lite',
      isStreaming: false,
      pendingIntent: null,

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      updateLastMessage: (patch) =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const messages = [...state.messages];
          const last = messages[messages.length - 1];
          messages[messages.length - 1] = { ...last, ...patch };
          return { messages };
        }),

      setStreaming: (v) => set({ isStreaming: v }),

      setModel: (model) => set({ selectedModel: model }),

      clearHistory: () => set({ messages: [] }),

      setPendingIntent: (intent) => set({ pendingIntent: intent }),
    }),
    {
      name: 'fd_chat_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        selectedModel: state.selectedModel,
      }),
    },
  ),
);
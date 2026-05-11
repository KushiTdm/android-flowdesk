// ---------------------------------------------------------------------------
// agenda.store.ts — Today's calendar events cache (no persistence)
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import type { CalendarEvent } from '../types/event.types';

interface AgendaState {
  events: CalendarEvent[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt: number | null;
  setEvents: (events: CalendarEvent[]) => void;
  setSyncStatus: (status: AgendaState['syncStatus']) => void;
}

export const useAgendaStore = create<AgendaState>()((set) => ({
  events: [],
  syncStatus: 'idle',
  lastSyncedAt: null,

  setEvents: (events) => set({ events, lastSyncedAt: Date.now() }),

  setSyncStatus: (status) => set({ syncStatus: status }),
}));

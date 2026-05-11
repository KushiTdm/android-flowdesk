// ---------------------------------------------------------------------------
// use-agenda.ts — Google Calendar agenda hook
// ---------------------------------------------------------------------------

import { useCredentials } from './use-credentials';
import { useAgendaStore } from '../store/agenda.store';
import { GoogleCalendarService } from '../services/google-calendar.service';

export function useAgenda() {
  const { credentials } = useCredentials();
  const store = useAgendaStore();

  const isNotConnected = !credentials.googleAccessToken;

  const fetchTodayEvents = async (): Promise<void> => {
    if (isNotConnected) return;

    store.setSyncStatus('syncing');
    try {
      const events = await GoogleCalendarService.getTodayEvents(
        credentials.googleAccessToken!,
      );
      store.setEvents(events);
      store.setSyncStatus('idle');
    } catch {
      store.setSyncStatus('error');
    }
  };

  return {
    events: store.events,
    syncStatus: store.syncStatus,
    lastSyncedAt: store.lastSyncedAt,
    isNotConnected,
    fetchTodayEvents,
  };
}

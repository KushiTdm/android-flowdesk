// ---------------------------------------------------------------------------
// use-crud-intent.ts — Executes AI intent blocks (task + event CRUD)
// ---------------------------------------------------------------------------

import { useCredentials } from './use-credentials';
import { useTasks } from './use-tasks';
import { useAgendaStore } from '../store/agenda.store';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { getUserFacingError } from '../utils/error.utils';
import type { AIIntent, IntentExecutionResult } from '../types/ai-intent.types';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';
import type { CreateEventInput } from '../types/event.types';

export function useCRUDIntent() {
  const { credentials, hasGoogle } = useCredentials();
  const { create: createTask, update: updateTask, remove: removeTask } = useTasks();
  const agendaStore = useAgendaStore();

  const execute = async (intent: AIIntent): Promise<IntentExecutionResult> => {
    try {
      const key = `${intent.action}:${intent.entity}` as const;

      switch (key) {
        // ------------------------------------------------------------------
        // Task operations
        // ------------------------------------------------------------------
        case 'CREATE:task': {
          await createTask(intent.data as CreateTaskInput);
          return { success: true, message: 'Tâche créée.' };
        }

        case 'UPDATE:task': {
          if (!intent.targetId) {
            return { success: false, error: 'ID de la tâche manquant.' };
          }
          await updateTask(intent.targetId, intent.data as UpdateTaskInput);
          return { success: true, message: 'Tâche mise à jour.' };
        }

        case 'DELETE:task': {
          if (!intent.targetId) {
            return { success: false, error: 'ID de la tâche manquant.' };
          }
          await removeTask(intent.targetId);
          return { success: true, message: 'Tâche supprimée.' };
        }

        // ------------------------------------------------------------------
        // Event operations
        // ------------------------------------------------------------------
        case 'CREATE:event': {
          if (!hasGoogle || !credentials.googleAccessToken) {
            return {
              success: false,
              error: 'Google Agenda non connecté. Configurez votre compte dans les paramètres.',
            };
          }
          const created = await GoogleCalendarService.createEvent(
            credentials.googleAccessToken,
            intent.data as CreateEventInput,
          );
          agendaStore.setEvents([...agendaStore.events, created]);
          return { success: true, message: 'Événement créé.' };
        }

        case 'UPDATE:event': {
          if (!hasGoogle || !credentials.googleAccessToken) {
            return {
              success: false,
              error: 'Google Agenda non connecté. Configurez votre compte dans les paramètres.',
            };
          }
          if (!intent.targetId) {
            return { success: false, error: "ID de l'événement manquant." };
          }
          const updated = await GoogleCalendarService.updateEvent(
            credentials.googleAccessToken,
            intent.targetId,
            intent.data as Partial<CreateEventInput>,
          );
          agendaStore.setEvents(
            agendaStore.events.map((e) =>
              e.googleEventId === intent.targetId || e.id === intent.targetId
                ? updated
                : e,
            ),
          );
          return { success: true, message: 'Événement mis à jour.' };
        }

        case 'DELETE:event': {
          if (!hasGoogle || !credentials.googleAccessToken) {
            return {
              success: false,
              error: 'Google Agenda non connecté. Configurez votre compte dans les paramètres.',
            };
          }
          if (!intent.targetId) {
            return { success: false, error: "ID de l'événement manquant." };
          }
          await GoogleCalendarService.deleteEvent(
            credentials.googleAccessToken,
            intent.targetId,
          );
          agendaStore.setEvents(
            agendaStore.events.filter(
              (e) =>
                e.googleEventId !== intent.targetId &&
                e.id !== intent.targetId,
            ),
          );
          return { success: true, message: 'Événement supprimé.' };
        }

        case 'READ:task':
        case 'READ:event':
          // READ is handled by the AI response text — no side effects needed
          return { success: true, message: 'Données consultées.' };

        default:
          return { success: false, error: 'Action non reconnue.' };
      }
    } catch (e) {
      return { success: false, error: getUserFacingError(e) };
    }
  };

  return { execute };
}

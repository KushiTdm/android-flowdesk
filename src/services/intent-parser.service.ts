// ---------------------------------------------------------------------------
// intent-parser.service.ts — System prompt builder + intent block parser
// ---------------------------------------------------------------------------

import type { CalendarEvent } from '../types/event.types';
import type { Task } from '../types/task.types';
import type { AIIntent, IntentAction, IntentEntity } from '../types/ai-intent.types';
import { formatDateDisplay, isoToTime, durationLabel } from '../utils/date.utils';
import { stripIntentBlock as _strip } from '../utils/sanitize.utils';

const VALID_ACTIONS: IntentAction[] = ['CREATE', 'UPDATE', 'DELETE', 'READ'];
const VALID_ENTITIES: IntentEntity[] = ['task', 'event'];

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

export function buildSystemPrompt(context: {
  todayEvents: CalendarEvent[];
  pendingTasks: Task[];
  userName?: string;
}): string {
  const { todayEvents, pendingTasks, userName } = context;
  const todayLabel = formatDateDisplay(new Date());

  const greeting = userName ? `Tu assistes ${userName}.` : 'Tu es un assistant personnel intelligent.';

  const eventsSection =
    todayEvents.length > 0
      ? [
          'Événements du jour :',
          ...todayEvents.map(
            (e) =>
              `  - [${e.id}] ${e.title} — ${isoToTime(e.start)} → ${isoToTime(e.end)} (${durationLabel(e.start, e.end)})${e.location ? ` @ ${e.location}` : ''}`,
          ),
        ].join('\n')
      : 'Aucun événement prévu aujourd\'hui.';

  const tasksSection =
    pendingTasks.length > 0
      ? [
          'Tâches en attente :',
          ...pendingTasks.map(
            (t) =>
              `  - [${t.id}] ${t.title} (${t.priority}, ${t.status})${t.dueDate ? ` — échéance : ${t.dueDate}` : ''}`,
          ),
        ].join('\n')
      : 'Aucune tâche en attente.';

  return `Tu es FlowDesk AI, l'assistant intelligent de l'application FlowDesk Mobile.
${greeting}
Nous sommes le ${todayLabel}.

${eventsSection}

${tasksSection}

---

RÈGLES IMPÉRATIVES :
1. Réponds TOUJOURS en français.
2. Quand l'utilisateur demande une action CRUD (créer, modifier, supprimer une tâche ou un événement), émets un bloc \`\`\`intent après ta réponse naturelle.
3. Structure du bloc intent :
\`\`\`intent
{
  "action": "CREATE" | "UPDATE" | "DELETE" | "READ",
  "entity": "task" | "event",
  "data": { ... champs de la ressource ... },
  "targetId": "id-de-la-ressource-cible (si UPDATE ou DELETE)",
  "requiresConfirmation": true | false
}
\`\`\`
4. requiresConfirmation DOIT être true pour :
   - Toute action DELETE (tâche ou événement)
   - Tout UPDATE d'un événement Google Agenda
   - Pour les créations simples de tâches, requiresConfirmation peut être false.
5. Pour les opérations READ, pas besoin de bloc intent — réponds directement.
6. N'invente jamais un targetId : utilise uniquement les IDs fournis dans le contexte ci-dessus.
7. Reste concis, bienveillant et professionnel.`;
}

// ---------------------------------------------------------------------------
// parseIntentFromResponse
// ---------------------------------------------------------------------------

export function parseIntentFromResponse(response: string): AIIntent | null {
  const match = response.match(/```intent\s*([\s\S]*?)```/);
  if (!match?.[1]) return null;

  try {
    const raw = JSON.parse(match[1].trim()) as Record<string, unknown>;

    const action = raw['action'] as IntentAction;
    const entity = raw['entity'] as IntentEntity;

    if (!VALID_ACTIONS.includes(action)) return null;
    if (!VALID_ENTITIES.includes(entity)) return null;

    // DELETE always forces requiresConfirmation
    const requiresConfirmation =
      action === 'DELETE' ? true : Boolean(raw['requiresConfirmation']);

    const intent: AIIntent = {
      action,
      entity,
      requiresConfirmation,
    };

    if (raw['data'] !== undefined && raw['data'] !== null) {
      intent.data = raw['data'] as AIIntent['data'];
    }

    if (typeof raw['targetId'] === 'string' && raw['targetId'].length > 0) {
      intent.targetId = raw['targetId'];
    }

    return intent;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// stripIntentBlock — re-exported from sanitize.utils for convenience
// ---------------------------------------------------------------------------

export function stripIntentBlock(response: string): string {
  return _strip(response);
}

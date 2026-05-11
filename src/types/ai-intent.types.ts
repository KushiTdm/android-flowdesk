import type { CreateTaskInput, UpdateTaskInput } from './task.types';
import type { CreateEventInput } from './event.types';

export type IntentAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
export type IntentEntity = 'task' | 'event';

export interface AIIntent {
  action:               IntentAction;
  entity:               IntentEntity;
  data?:                CreateTaskInput | UpdateTaskInput | CreateEventInput | Partial<CreateEventInput>;
  targetId?:            string;
  requiresConfirmation: boolean;
}

export interface ChatMessage {
  id:          string;
  role:        'user' | 'assistant';
  text:        string;
  time:        string;
  intent?:     AIIntent;
  hasActions?: boolean;
  streaming?:  boolean;
}

export type IntentExecutionResult = {
  success: true;
  message: string;
} | {
  success: false;
  error:   string;
};

export type TaskPriority = 'urgent' | 'normal' | 'doing';
export type TaskStatus   = 'todo' | 'in_progress' | 'done';
export type TaskSource   = 'local' | 'airtable' | 'supabase';

export interface Task {
  id:          string;
  title:       string;
  subtitle?:   string;
  priority:    TaskPriority;
  status:      TaskStatus;
  dueDate?:    string;
  tag?:        string;
  progress?:   number;
  fromAI:      boolean;
  source:      TaskSource;
  externalId?: string;
  createdAt:   string;
  updatedAt:   string;
}

export interface CreateTaskInput {
  title:       string;
  subtitle?:   string;
  priority?:   TaskPriority;
  dueDate?:    string;
  tag?:        string;
  fromAI?:     boolean;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  progress?: number;
}

export type TaskFilter = 'all' | 'urgent' | 'doing' | 'done' | 'ai';

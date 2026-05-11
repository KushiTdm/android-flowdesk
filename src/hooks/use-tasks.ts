// ---------------------------------------------------------------------------
// use-tasks.ts — Task CRUD hook with external sync (Airtable / Supabase)
// ---------------------------------------------------------------------------

import { useCredentials } from './use-credentials';
import { useTasksStore } from '../store/tasks.store';
import { AirtableService } from '../services/airtable.service';
import { SupabaseService } from '../services/supabase.service';
import { getUserFacingError } from '../utils/error.utils';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from '../types/task.types';

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

function airtableRecordToTask(record: { id: string; fields: Record<string, unknown>; createdTime: string }): Task {
  const f = record.fields;
  return {
    id: generateId(),
    externalId: record.id,
    title: String(f['title'] ?? f['Name'] ?? ''),
    subtitle: f['subtitle'] != null ? String(f['subtitle']) : undefined,
    priority: (f['priority'] as Task['priority']) ?? 'normal',
    status: (f['status'] as Task['status']) ?? 'todo',
    dueDate: f['dueDate'] != null ? String(f['dueDate']) : undefined,
    tag: f['tag'] != null ? String(f['tag']) : undefined,
    progress: f['progress'] != null ? Number(f['progress']) : undefined,
    fromAI: Boolean(f['fromAI'] ?? false),
    source: 'airtable',
    createdAt: record.createdTime,
    updatedAt: record.createdTime,
  };
}

export function useTasks() {
  const { credentials, hasAirtable, hasSupabase } = useCredentials();
  const store = useTasksStore();

  // -------------------------------------------------------------------------
  // Create
  // -------------------------------------------------------------------------

  const create = async (input: CreateTaskInput): Promise<Task> => {
    const now = new Date().toISOString();
    let task: Task = {
      id: generateId(),
      title: input.title,
      subtitle: input.subtitle,
      priority: input.priority ?? 'normal',
      status: 'todo',
      dueDate: input.dueDate,
      tag: input.tag,
      fromAI: input.fromAI ?? false,
      source: 'local',
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (hasAirtable) {
        const fields: Record<string, unknown> = {
          title: task.title,
          priority: task.priority,
          status: task.status,
          fromAI: task.fromAI,
        };
        if (task.subtitle) fields['subtitle'] = task.subtitle;
        if (task.dueDate) fields['dueDate'] = task.dueDate;
        if (task.tag) fields['tag'] = task.tag;

        const externalId = await AirtableService.createRecord(
          credentials.airtableApiKey!,
          credentials.airtableBaseId!,
          credentials.airtableTableId!,
          fields,
        );
        task = { ...task, source: 'airtable', externalId };
      } else if (hasSupabase) {
        const externalId = await SupabaseService.insertTask(
          credentials.supabaseUrl!,
          credentials.supabaseAnonKey!,
          task,
        );
        task = { ...task, source: 'supabase', externalId };
      }
    } catch (e) {
      // External sync failed — keep local copy, log presence only
      console.warn('Task sync failed:', { hasError: true, message: getUserFacingError(e) });
    }

    store.addTask(task);
    return task;
  };

  // -------------------------------------------------------------------------
  // Update
  // -------------------------------------------------------------------------

  const update = async (id: string, input: UpdateTaskInput): Promise<void> => {
    // Optimistic update
    store.updateTask(id, input);

    const task = useTasksStore.getState().tasks.find((t) => t.id === id);
    if (!task?.externalId) return;

    try {
      const fields: Record<string, unknown> = {};
      if (input.title !== undefined) fields['title'] = input.title;
      if (input.subtitle !== undefined) fields['subtitle'] = input.subtitle;
      if (input.priority !== undefined) fields['priority'] = input.priority;
      if (input.status !== undefined) fields['status'] = input.status;
      if (input.dueDate !== undefined) fields['dueDate'] = input.dueDate;
      if (input.tag !== undefined) fields['tag'] = input.tag;
      if (input.progress !== undefined) fields['progress'] = input.progress;

      if (task.source === 'airtable' && hasAirtable) {
        await AirtableService.updateRecord(
          credentials.airtableApiKey!,
          credentials.airtableBaseId!,
          credentials.airtableTableId!,
          task.externalId,
          fields,
        );
      } else if (task.source === 'supabase' && hasSupabase) {
        await SupabaseService.updateTask(
          credentials.supabaseUrl!,
          credentials.supabaseAnonKey!,
          task.externalId,
          input,
        );
      }
    } catch (e) {
      console.warn('Task update sync failed:', { hasError: true, message: getUserFacingError(e) });
    }
  };

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  const remove = async (id: string): Promise<void> => {
    const task = store.tasks.find((t) => t.id === id);

    // Optimistic delete
    store.deleteTask(id);

    if (!task?.externalId) return;

    try {
      if (task.source === 'airtable' && hasAirtable) {
        await AirtableService.deleteRecord(
          credentials.airtableApiKey!,
          credentials.airtableBaseId!,
          credentials.airtableTableId!,
          task.externalId,
        );
      } else if (task.source === 'supabase' && hasSupabase) {
        await SupabaseService.deleteTask(
          credentials.supabaseUrl!,
          credentials.supabaseAnonKey!,
          task.externalId,
        );
      }
    } catch (e) {
      console.warn('Task delete sync failed:', { hasError: true, message: getUserFacingError(e) });
    }
  };

  // -------------------------------------------------------------------------
  // Fetch all (from external source if configured)
  // -------------------------------------------------------------------------

  const fetchAll = async (): Promise<void> => {
    if (!hasAirtable) return; // Supabase fallback is local-only for now

    store.setSyncStatus('syncing');
    try {
      const records = await AirtableService.listRecords(
        credentials.airtableApiKey!,
        credentials.airtableBaseId!,
        credentials.airtableTableId!,
      );
      const tasks = records.map(airtableRecordToTask);
      store.setTasks(tasks);
      store.setSyncStatus('idle');
    } catch (e) {
      console.warn('fetchAll failed:', { hasError: true, message: getUserFacingError(e) });
      store.setSyncStatus('error');
    }
  };

  // -------------------------------------------------------------------------
  // Filtered tasks
  // -------------------------------------------------------------------------

  const filter: TaskFilter = store.filter;

  const filteredTasks = store.tasks.filter((t) => {
    switch (filter) {
      case 'urgent':  return t.priority === 'urgent';
      case 'doing':   return t.status === 'in_progress';
      case 'done':    return t.status === 'done';
      case 'ai':      return t.fromAI;
      default:        return true;
    }
  });

  return {
    tasks: store.tasks,
    filteredTasks,
    filter,
    syncStatus: store.syncStatus,
    setFilter: store.setFilter,
    create,
    update,
    remove,
    fetchAll,
  };
}

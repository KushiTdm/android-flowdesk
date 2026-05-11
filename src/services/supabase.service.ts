// ---------------------------------------------------------------------------
// supabase.service.ts — Supabase task CRUD via lazy client
// ---------------------------------------------------------------------------

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Task } from '../types/task.types';
import { SupabaseError } from '../utils/error.utils';

// ---------------------------------------------------------------------------
// Lazy client — recreated when url/key change
// ---------------------------------------------------------------------------

let _client: SupabaseClient | null = null;
let _config = { url: '', key: '' };

function getClient(url: string, anonKey: string): SupabaseClient {
  if (_client && _config.url === url && _config.key === anonKey) {
    return _client;
  }
  _client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  _config = { url, key: anonKey };
  return _client;
}

// ---------------------------------------------------------------------------
// SupabaseService
// ---------------------------------------------------------------------------

export const SupabaseService = {
  /** Inserts a task into the "tasks" table. Returns the generated row ID. */
  async insertTask(url: string, anonKey: string, task: Task): Promise<string> {
    const client = getClient(url, anonKey);
    const { data, error } = await client
      .from('tasks')
      .insert({ ...task })
      .select('id')
      .single();

    if (error) throw new SupabaseError(error.message, error.code ?? 'UNKNOWN');
    if (!data) throw new SupabaseError('No data returned from insert', 'NO_DATA');

    return String((data as { id: string }).id);
  },

  /** Updates a task row by its external (Supabase) ID */
  async updateTask(
    url: string,
    anonKey: string,
    externalId: string,
    fields: Partial<Task>,
  ): Promise<void> {
    const client = getClient(url, anonKey);
    const { error } = await client
      .from('tasks')
      .update({ ...fields, updatedAt: new Date().toISOString() })
      .eq('id', externalId);

    if (error) throw new SupabaseError(error.message, error.code ?? 'UNKNOWN');
  },

  /** Deletes a task row by its external (Supabase) ID */
  async deleteTask(
    url: string,
    anonKey: string,
    externalId: string,
  ): Promise<void> {
    const client = getClient(url, anonKey);
    const { error } = await client.from('tasks').delete().eq('id', externalId);

    if (error) throw new SupabaseError(error.message, error.code ?? 'UNKNOWN');
  },

  /** Validates credentials by checking the "tasks" table exists (limit 1) */
  async validateCredentials(url: string, anonKey: string): Promise<boolean> {
    try {
      const client = getClient(url, anonKey);
      const { error } = await client.from('tasks').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },
};

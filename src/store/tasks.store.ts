// ---------------------------------------------------------------------------
// tasks.store.ts — Task list with persistence + demo seed data
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, TaskFilter } from '../types/task.types';

// ---------------------------------------------------------------------------
// Seed data — injected on first launch when tasks list is empty
// ---------------------------------------------------------------------------

const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finaliser le brief client Aurore',
    priority: 'urgent',
    status: 'todo',
    dueDate: new Date().toISOString(),
    tag: 'Q2',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Relire la proposition technique',
    priority: 'urgent',
    status: 'todo',
    tag: 'Aurore',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Préparer la présentation Q2',
    priority: 'normal',
    status: 'todo',
    fromAI: true,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Appeler Marie pour signature',
    priority: 'normal',
    status: 'todo',
    tag: 'Legal',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Mettre à jour Airtable Clients',
    priority: 'normal',
    status: 'in_progress',
    tag: 'Ops',
    progress: 0.25,
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Répondre candidats Lead Designer',
    priority: 'normal',
    status: 'in_progress',
    tag: 'Recrut',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: "Lire l'étude marché fintech",
    priority: 'normal',
    status: 'done',
    tag: 'Veille',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-8',
    title: 'Envoyer facture Q1',
    priority: 'normal',
    status: 'done',
    tag: 'Finance',
    fromAI: false,
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TasksState {
  tasks: Task[];
  filter: TaskFilter;
  syncStatus: 'idle' | 'syncing' | 'error';
  setFilter: (filter: TaskFilter) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setSyncStatus: (status: TasksState['syncStatus']) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: SEED_TASKS,
      filter: 'all',
      syncStatus: 'idle',

      setFilter: (filter) => set({ filter }),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      setSyncStatus: (status) => set({ syncStatus: status }),
    }),
    {
      name: 'fd_tasks_v1',
      storage: createJSONStorage(() => AsyncStorage),
      // On hydration: if persisted tasks is empty, keep seed data
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<TasksState>;
        if (!persistedState.tasks || persistedState.tasks.length === 0) {
          return { ...current, ...persistedState, tasks: SEED_TASKS };
        }
        return { ...current, ...persistedState };
      },
    },
  ),
);

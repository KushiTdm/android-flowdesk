// ---------------------------------------------------------------------------
// Edit Task modal — app/modals/edit-task.tsx
// Route: /modals/edit-task?taskId=xxx  |  presentation: transparentModal
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Badge } from '@/src/components/atoms/Badge';
import { Button } from '@/src/components/atoms/Button';
import { Input } from '@/src/components/atoms/Input';
import { BottomSheet } from '@/src/components/organisms/BottomSheet';
import { useTasks } from '@/src/hooks/use-tasks';
import type { TaskPriority } from '@/src/types/task.types';

// ---------------------------------------------------------------------------
// Priority options
// ---------------------------------------------------------------------------

interface PriorityOption {
  value: TaskPriority;
  label: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'doing',  label: 'En cours' },
  { value: 'urgent', label: 'Urgent' },
];

// ---------------------------------------------------------------------------
// Due date chips
// ---------------------------------------------------------------------------

const DUE_CHIPS = ['Aujourd\'hui', 'Demain', 'Cette semaine', 'Aucune'] as const;
type DueChip = typeof DUE_CHIPS[number];

function getDueDateFromChip(chip: DueChip): string | undefined {
  const now = new Date();
  switch (chip) {
    case 'Aujourd\'hui':
      return now.toISOString().split('T')[0];
    case 'Demain': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }
    case 'Cette semaine': {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    }
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// EditTaskModal
// ---------------------------------------------------------------------------

export default function EditTaskModal(): React.ReactElement {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { tasks, update } = useTasks();

  const task = tasks.find((t) => t.id === taskId);

  // Task not found fallback
  if (task === undefined) {
    return (
      <View style={styles.backdrop}>
        <BottomSheet
          isOpen
          onClose={() => router.back()}
          title="Tâche introuvable"
          snapHeight="32%"
        >
          <View style={styles.notFoundContent}>
            <FDText variant="body" color={COLORS.textMuted} align="center">
              Cette tâche n'existe plus.
            </FDText>
            <Button variant="primary" onPress={() => router.back()} style={styles.notFoundBtn}>
              Fermer
            </Button>
          </View>
        </BottomSheet>
      </View>
    );
  }

  // Editable state (must be inside a child component since hooks can't come after conditional returns)
  return <EditTaskForm taskId={taskId} />;
}

// ---------------------------------------------------------------------------
// EditTaskForm (inner component — keeps hooks after all early returns)
// ---------------------------------------------------------------------------

function EditTaskForm({ taskId }: { taskId: string }): React.ReactElement {
  const router = useRouter();
  const { tasks, update } = useTasks();
  const task = tasks.find((t) => t.id === taskId)!;

  const [title, setTitle] = React.useState(task.title);
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [dueChip, setDueChip] = React.useState<DueChip | null>(null);

  const handleUpdate = async (): Promise<void> => {
    if (!title.trim()) return;
    await update(task.id, {
      title: title.trim(),
      priority,
      dueDate: dueChip !== null ? getDueDateFromChip(dueChip) : task.dueDate,
    });
    router.back();
  };

  const handleToggleDone = async (): Promise<void> => {
    await update(task.id, {
      status: task.status === 'done' ? 'todo' : 'done',
    });
  };

  const isDone = task.status === 'done';

  return (
    <View style={styles.backdrop}>
      <BottomSheet isOpen onClose={() => router.back()} title="Modifier la tâche" snapHeight="72%">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Done badge row */}
          {isDone && (
            <View style={styles.doneRow}>
              <Badge kind="neutral">Terminé</Badge>
              <Pressable onPress={() => { void handleToggleDone(); }} style={styles.reopenBtn}>
                <FDText variant="caption" color={COLORS.accent}>Rouvrir</FDText>
              </Pressable>
            </View>
          )}

          {/* Title input */}
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de la tâche"
          />

          {/* Priority */}
          <FDText variant="label" style={styles.sectionLabel}>PRIORITÉ</FDText>
          <View style={styles.chipRow}>
            {PRIORITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPriority(opt.value)}
                style={[
                  styles.chip,
                  priority === opt.value ? styles.chipSelected : styles.chipUnselected,
                ]}
              >
                <FDText
                  variant="caption"
                  color={priority === opt.value ? COLORS.bgDeep : COLORS.textMuted}
                  style={styles.chipText}
                >
                  {opt.label}
                </FDText>
              </Pressable>
            ))}
          </View>

          {/* Due date */}
          <FDText variant="label" style={styles.sectionLabel}>ÉCHÉANCE</FDText>
          {task.dueDate !== undefined && dueChip === null && (
            <FDText variant="caption" color={COLORS.textMuted} style={styles.currentDue}>
              Actuelle : {task.dueDate}
            </FDText>
          )}
          <View style={styles.chipRow}>
            {DUE_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setDueChip(dueChip === chip ? null : chip)}
                style={[
                  styles.chip,
                  dueChip === chip ? styles.chipSelected : styles.chipUnselected,
                ]}
              >
                <FDText
                  variant="caption"
                  color={dueChip === chip ? COLORS.bgDeep : COLORS.textMuted}
                  style={styles.chipText}
                >
                  {chip}
                </FDText>
              </Pressable>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="secondary"
              onPress={() => router.back()}
              style={styles.actionBtn}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={() => { void handleUpdate(); }}
              disabled={!title.trim()}
              style={styles.actionBtn}
            >
              Mettre à jour
            </Button>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  } as ViewStyle,
  flex: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  } as ViewStyle,

  // Not found
  notFoundContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    alignItems: 'center',
  } as ViewStyle,
  notFoundBtn: {
    alignSelf: 'stretch',
  } as ViewStyle,

  // Done banner
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  } as ViewStyle,
  reopenBtn: {
    paddingVertical: 2,
  } as ViewStyle,

  sectionLabel: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  currentDue: {
    marginBottom: SPACING.xs,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  } as ViewStyle,
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.pill,
  } as ViewStyle,
  chipSelected: {
    backgroundColor: COLORS.accent,
  } as ViewStyle,
  chipUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  } as ViewStyle,
  chipText: {
    fontFamily: TYPOGRAPHY.uiMedium,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  } as ViewStyle,
  actionBtn: {
    flex: 1,
  } as ViewStyle,
});

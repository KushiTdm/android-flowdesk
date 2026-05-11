// ---------------------------------------------------------------------------
// Add Task modal — app/modals/add-task.tsx
// Route: /modals/add-task  |  presentation: transparentModal
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
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
// AddTaskModal
// ---------------------------------------------------------------------------

export default function AddTaskModal(): React.ReactElement {
  const router = useRouter();
  const { create } = useTasks();

  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('normal');
  const [dueChip, setDueChip] = React.useState<DueChip | null>(null);

  const handleCreate = async (): Promise<void> => {
    if (!title.trim()) return;
    await create({
      title: title.trim(),
      priority,
      dueDate: dueChip !== null ? getDueDateFromChip(dueChip) : undefined,
      fromAI: false,
    });
    router.back();
  };

  return (
    <View style={styles.backdrop}>
      <BottomSheet isOpen onClose={() => router.back()} title="Nouvelle tâche" snapHeight="72%">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de la tâche"
            autoFocus
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
              onPress={() => { void handleCreate(); }}
              disabled={!title.trim()}
              style={styles.actionBtn}
            >
              Créer
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

  sectionLabel: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
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

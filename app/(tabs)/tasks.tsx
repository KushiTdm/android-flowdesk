// ---------------------------------------------------------------------------
// Tasks screen — app/(tabs)/tasks.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Button } from '@/src/components/atoms/Button';
import { TaskCard } from '@/src/components/molecules/TaskCard';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';
import { Header } from '@/src/components/organisms/Header';
import { FAB } from '@/src/components/organisms/FAB';
import { useTasks } from '@/src/hooks/use-tasks';
import type { TaskFilter } from '@/src/types/task.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILTER_LABELS: Record<TaskFilter, string> = {
  all:    'Tout',
  urgent: 'Urgent',
  doing:  'En cours',
  done:   'Terminé',
  ai:     'IA',
};

const FILTER_ORDER: TaskFilter[] = ['all', 'urgent', 'doing', 'done', 'ai'];

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState(): React.ReactElement {
  return (
    <View style={styles.emptyState}>
      <Icon name="Check" size={48} color={COLORS.textFaint} />
      <FDText variant="bodyMedium" align="center" style={{ marginTop: SPACING.lg }}>
        Tout est en ordre
      </FDText>
      <FDText variant="caption" align="center" style={{ marginTop: SPACING.sm }} color={COLORS.textMuted}>
        Aucune tâche pour ce filtre
      </FDText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AIBanner
// ---------------------------------------------------------------------------

function AIBanner(): React.ReactElement {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return <View />;

  return (
    <View style={styles.aiBanner}>
      <View style={styles.aiBannerLine} />
      <View style={styles.aiBannerContent}>
        <View style={styles.aiBannerHeader}>
          <Icon name="Sparkle" size={14} color={COLORS.accent} />
          <FDText variant="caption" color={COLORS.accent}>Suggestion Gemini</FDText>
        </View>
        <FDText variant="body" style={styles.aiBannerText}>
          Divisez "Préparer la présentation Q2" en sous-tâches
        </FDText>
        <View style={styles.aiBannerActions}>
          <Button variant="ai" size="sm" onPress={() => setDismissed(true)}>
            Diviser
          </Button>
          <Pressable onPress={() => setDismissed(true)} style={styles.aiBannerDismiss}>
            <FDText variant="caption" color={COLORS.textFaint}>Plus tard</FDText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// TasksScreen
// ---------------------------------------------------------------------------

export default function TasksScreen(): React.ReactElement {
  const router = useRouter();
  const { tasks, filteredTasks, filter, setFilter, update, remove } = useTasks();

  const openCount = tasks.filter((t) => t.status !== 'done').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <GradientBackground style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.flex}>
          <Header
            eyebrow="TÂCHES"
            title="À faire"
            titleVariant="displayIt"
            subtitle={`${openCount} ouvertes · ${doneCount} terminées`}
            rightAction={<Icon name="More" color={COLORS.textMuted} />}
          />

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            style={styles.filterScroll}
          >
            {FILTER_ORDER.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.chip,
                  filter === f ? styles.chipActive : styles.chipInactive,
                ]}
              >
                <FDText
                  variant="caption"
                  color={filter === f ? COLORS.bgDeep : COLORS.textMuted}
                  style={styles.chipText}
                >
                  {FILTER_LABELS[f]}
                </FDText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Task list */}
          <FlatList
            data={filteredTasks}
            keyExtractor={(t) => t.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: task, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <TaskCard
                  task={task}
                  onCheck={() => {
                    void update(task.id, {
                      status: task.status === 'done' ? 'todo' : 'done',
                    });
                  }}
                  onDelete={() => { void remove(task.id); }}
                  onPress={() =>
                    router.push({
                      pathname: '/modals/edit-task',
                      params: { taskId: task.id },
                    })
                  }
                />
              </Animated.View>
            )}
            ListEmptyComponent={<EmptyState />}
            ListFooterComponent={filteredTasks.length > 0 ? <AIBanner /> : null}
            showsVerticalScrollIndicator={false}
          />

          <FAB onPress={() => router.push('/modals/add-task')} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  } as ViewStyle,

  // Filter scroll
  filterScroll: {
    marginTop: SPACING.md,
    flexGrow: 0,
  } as ViewStyle,
  filterChips: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.pill,
  } as ViewStyle,
  chipActive: {
    backgroundColor: COLORS.accent,
  } as ViewStyle,
  chipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  } as ViewStyle,
  chipText: {
    fontWeight: '500',
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 120,
    gap: SPACING.sm,
  } as ViewStyle,

  // EmptyState
  emptyState: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: SPACING.xxl,
  } as ViewStyle,

  // AIBanner
  aiBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentMist,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.accentGlow,
    overflow: 'hidden',
    marginTop: SPACING.md,
  } as ViewStyle,
  aiBannerLine: {
    width: 2,
    backgroundColor: COLORS.accent,
    borderRadius: RADII.pill,
    marginVertical: SPACING.sm,
    marginLeft: SPACING.sm,
  } as ViewStyle,
  aiBannerContent: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  } as ViewStyle,
  aiBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  } as ViewStyle,
  aiBannerText: {
    color: COLORS.text,
  },
  aiBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  } as ViewStyle,
  aiBannerDismiss: {
    paddingVertical: 4,
  } as ViewStyle,
});

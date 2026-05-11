// ---------------------------------------------------------------------------
// Dashboard — Aujourd'hui (index.tsx)
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Badge } from '@/src/components/atoms/Badge';
import { Button } from '@/src/components/atoms/Button';
import { TaskCard } from '@/src/components/molecules/TaskCard';
import { MetricCard } from '@/src/components/molecules/MetricCard';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';
import { useTasks } from '@/src/hooks/use-tasks';
import { useAgenda } from '@/src/hooks/use-agenda';
import type { CalendarEvent } from '@/src/types/event.types';
import { CALENDAR_COLORS } from '@/src/types/event.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour,';
  if (h < 18) return 'Bon après-midi,';
  return 'Bonsoir,';
}

function formatTodayEyebrow(): string {
  const d = new Date();
  return d
    .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase();
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (iso: string): string =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ---------------------------------------------------------------------------
// NotConnectedState
// ---------------------------------------------------------------------------

function NotConnectedState({
  message,
  onPress,
}: {
  message: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <View style={styles.notConnected}>
      <Icon name="Cloud" size={48} color={COLORS.textFaint} />
      <FDText
        variant="bodyMedium"
        color={COLORS.textMuted}
        align="center"
        style={styles.notConnectedText}
      >
        {message}
      </FDText>
      <Button variant="secondary" onPress={onPress}>
        Configurer
      </Button>
    </View>
  );
}

// ---------------------------------------------------------------------------
// HeroEventCard
// ---------------------------------------------------------------------------

const CALENDAR_LABEL: Record<string, string> = {
  travail: 'Travail',
  perso:   'Personnel',
  recrut:  'Recrutement',
};

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 50;

function HeroEventCard({ event }: { event: CalendarEvent }): React.ReactElement {
  const calColor = CALENDAR_COLORS[event.calendar] ?? COLORS.accent;
  const calLabel = CALENDAR_LABEL[event.calendar] ?? event.calendar;

  return (
    <View style={styles.heroCard}>
      <BlurView intensity={BLUR_INTENSITY} tint="light" style={styles.heroBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Inner border line */}
        <View style={[styles.heroAccentLine, { backgroundColor: calColor }]} />

        <View style={styles.heroContent}>
          <Badge kind="info">{calLabel}</Badge>
          <FDText variant="bodyMedium" size={20} style={styles.heroTitle}>
            {event.title}
          </FDText>
          <View style={styles.heroMeta}>
            <Icon name="Clock" size={13} color={COLORS.textMuted} />
            <FDText variant="mono">{formatTimeRange(event.start, event.end)}</FDText>
          </View>
          {event.location !== undefined && (
            <FDText variant="caption" style={styles.heroLocation}>
              {event.location}
            </FDText>
          )}
        </View>
      </BlurView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AISuggestionBanner
// ---------------------------------------------------------------------------

function AISuggestionBanner(): React.ReactElement {
  const [dismissed, setDismissed] = React.useState(false);
  const router = useRouter();

  if (dismissed) return <View />;

  return (
    <View style={styles.aiBanner}>
      <View style={styles.aiBannerInner}>
        {/* Left accent border */}
        <View style={styles.aiBannerLine} />

        <View style={styles.aiBannerContent}>
          <View style={styles.aiBannerHeader}>
            <Icon name="Sparkle" size={16} color={COLORS.accent} />
            <FDText variant="caption" color={COLORS.accent}>
              Suggestion · Gemini
            </FDText>
          </View>
          <FDText variant="body" style={styles.aiBannerMessage}>
            Vous avez 2 heures libres cet après-midi pour préparer la présentation Q2
          </FDText>
          <View style={styles.aiBannerActions}>
            <Button
              variant="ai"
              size="sm"
              onPress={() => { router.push('/modals/add-event' as never); }}
            >
              Planifier
            </Button>
            <Pressable onPress={() => setDismissed(true)} style={styles.aiBannerDismiss}>
              <FDText variant="caption" color={COLORS.textFaint}>
                Plus tard
              </FDText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// DashboardScreen
// ---------------------------------------------------------------------------

export default function DashboardScreen(): React.ReactElement {
  const router = useRouter();
  const { tasks, fetchAll, update: updateTask, remove: removeTask } = useTasks();
  const { events, fetchTodayEvents } = useAgenda();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayEvents(), fetchAll()]);
    setRefreshing(false);
  }, [fetchTodayEvents, fetchAll]);

  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');
  const currentEvent = events.find((e) => e.isCurrent === true) ?? null;
  const todayTasks = pendingTasks.slice(0, 4);

  const toggleTask = (id: string): void => {
    const task = tasks.find((t) => t.id === id);
    if (task === undefined) return;
    void updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' });
  };

  return (
    <GradientBackground style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
            />
          }
        >
          {/* ── Header ── */}
          <View style={styles.sectionHeader}>
            <FDText variant="eyebrow">{formatTodayEyebrow()}</FDText>
            <View style={styles.greetingRow}>
              <FDText variant="displayIt" size={30}>
                {getGreeting()}
              </FDText>
              <Pressable onPress={() => {}}>
                <Icon name="Bell" size={22} color={COLORS.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* ── Métriques ── */}
          <View style={styles.metricsSection}>
            <View style={styles.metricsRow}>
              <MetricCard
                value={pendingTasks.length}
                label="TÂCHES"
                tone="accent"
                style={styles.metricFlex}
              />
              <MetricCard
                value={urgentTasks.length}
                label="URGENTES"
                tone="danger"
                style={styles.metricFlex}
              />
              <MetricCard
                value={events.length}
                label="RÉUNIONS"
                tone="info"
                style={styles.metricFlex}
              />
            </View>
          </View>

          {/* ── Maintenant ── */}
          <View style={styles.section}>
            <FDText variant="label">MAINTENANT</FDText>
            <View style={styles.sectionContent}>
              {currentEvent !== null ? (
                <HeroEventCard event={currentEvent} />
              ) : (
                <FDText variant="body" color={COLORS.textFaint}>
                  Aucun événement en cours
                </FDText>
              )}
            </View>
          </View>

          {/* ── Tâches du jour ── */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <FDText variant="label">AUJOURD'HUI</FDText>
              <Pressable onPress={() => {}}>
                <FDText variant="caption" color={COLORS.accent}>
                  Tout voir
                </FDText>
              </Pressable>
            </View>
            <View style={styles.sectionContent}>
              {todayTasks.length === 0 ? (
                <NotConnectedState
                  message="Aucune tâche en cours. Connectez un service ou ajoutez une tâche."
                  onPress={() => { router.push('/profile' as never); }}
                />
              ) : (
                todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    onCheck={() => toggleTask(task.id)}
                    onDelete={() => { void removeTask(task.id); }}
                  />
                ))
              )}
            </View>
          </View>

          {/* ── Suggestion IA ── */}
          <View style={styles.section}>
            <AISuggestionBanner />
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 120,
  },

  // Header
  sectionHeader: {
    paddingTop: 8,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  } as ViewStyle,
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  } as ViewStyle,

  // Metrics
  metricsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  } as ViewStyle,
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  } as ViewStyle,
  metricFlex: {
    flex: 1,
  } as ViewStyle,

  // Section generic
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  } as ViewStyle,
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  sectionContent: {
    gap: SPACING.sm,
  } as ViewStyle,

  // HeroEventCard
  heroCard: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  } as ViewStyle,
  heroBlur: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    overflow: 'hidden',
    flexDirection: 'row',
  } as ViewStyle,
  heroAccentLine: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: RADII.pill,
    marginVertical: SPACING.md,
    marginLeft: SPACING.sm,
  } as ViewStyle,
  heroContent: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.xs,
  } as ViewStyle,
  heroTitle: {
    marginTop: SPACING.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  heroLocation: {
    color: COLORS.textFaint,
  },

  // AISuggestionBanner
  aiBanner: {
    borderRadius: RADII.md,
    overflow: 'hidden',
  } as ViewStyle,
  aiBannerInner: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentGlow,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.accentMist,
    overflow: 'hidden',
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
  aiBannerMessage: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.base,
  },
  aiBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  } as ViewStyle,
  aiBannerDismiss: {
    paddingVertical: 4,
  } as ViewStyle,

  // NotConnectedState
  notConnected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  } as ViewStyle,
  notConnectedText: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

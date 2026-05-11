// ---------------------------------------------------------------------------
// Agenda — Vue du jour avec timeline (données Google Calendar réelles)
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Button } from '@/src/components/atoms/Button';
import { EventCard } from '@/src/components/molecules/EventCard';
import { Header } from '@/src/components/organisms/Header';
import { FAB } from '@/src/components/organisms/FAB';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';
import { useAgenda } from '@/src/hooks/use-agenda';
import type { CalendarEvent } from '@/src/types/event.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHHMM(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatTodayEyebrow(): string {
  return new Date()
    .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// NotConnectedState
// ---------------------------------------------------------------------------

function NotConnectedState({
  onPress,
}: {
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
        Connectez Google Agenda pour voir vos événements
      </FDText>
      <Button variant="secondary" onPress={onPress}>
        Configurer dans le profil
      </Button>
    </View>
  );
}

// ---------------------------------------------------------------------------
// EmptyDayState — connected but no events
// ---------------------------------------------------------------------------

function EmptyDayState({ onAddEvent }: { onAddEvent: () => void }): React.ReactElement {
  return (
    <View style={styles.notConnected}>
      <Icon name="Calendar" size={48} color={COLORS.textFaint} />
      <FDText
        variant="bodyMedium"
        color={COLORS.textMuted}
        align="center"
        style={styles.notConnectedText}
      >
        Aucun événement aujourd'hui
      </FDText>
      <Button variant="secondary" onPress={onAddEvent}>
        Ajouter un événement
      </Button>
    </View>
  );
}

// ---------------------------------------------------------------------------
// FreeSlotCard
// ---------------------------------------------------------------------------

function FreeSlotCard({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}): React.ReactElement {
  return (
    <View style={styles.freeSlot}>
      <FDText variant="caption" color={COLORS.textFaint}>
        Créneau libre · jusqu'à {endTime}
      </FDText>
      <FDText variant="caption" color={COLORS.accent}>
        Planifier +
      </FDText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// DayStrip
// ---------------------------------------------------------------------------

function DayStrip({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (i: number) => void;
}): React.ReactElement {
  const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dayStripContent}
      style={styles.dayStrip}
    >
      {days.map((day, idx) => {
        const isActive = idx === selectedIndex;
        return (
          <Pressable
            key={idx}
            onPress={() => onSelect(idx)}
            style={[styles.dayCell, isActive && styles.dayCellActive]}
          >
            <FDText
              variant="eyebrow"
              size={TYPOGRAPHY.xs}
              color={isActive ? COLORS.bgBase : COLORS.textFaint}
            >
              {DAY_LETTERS[day.getDay()]}
            </FDText>
            <FDText
              variant="bodyMedium"
              color={isActive ? COLORS.bgBase : COLORS.text}
            >
              {day.getDate().toString()}
            </FDText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Timeline builder
// ---------------------------------------------------------------------------

type TimelineItem =
  | { kind: 'event'; event: CalendarEvent }
  | { kind: 'free'; startTime: string; endTime: string; id: string };

function buildTimeline(events: CalendarEvent[]): TimelineItem[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const items: TimelineItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    items.push({ kind: 'event', event: ev });

    const next = sorted[i + 1];
    if (next !== undefined) {
      const endMs = new Date(ev.end).getTime();
      const nextStartMs = new Date(next.start).getTime();
      const gapMinutes = (nextStartMs - endMs) / 60_000;
      if (gapMinutes >= 15) {
        items.push({
          kind: 'free',
          startTime: formatHHMM(ev.end),
          endTime: formatHHMM(next.start),
          id: `free-${i}`,
        });
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// AgendaScreen
// ---------------------------------------------------------------------------

export default function AgendaScreen(): React.ReactElement {
  const router = useRouter();
  const { events, isNotConnected, fetchTodayEvents, syncStatus } = useAgenda();

  const [refreshing, setRefreshing] = React.useState(false);
  const [activeDay, setActiveDay] = React.useState(3); // centre = aujourd'hui

  // Fetch on mount
  React.useEffect(() => {
    void fetchTodayEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTodayEvents();
    setRefreshing(false);
  }, [fetchTodayEvents]);

  const isLoading = syncStatus === 'syncing';
  const timeline = buildTimeline(events);

  return (
    <GradientBackground style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.flex}>
          {/* Header */}
          <Header
            eyebrow={formatTodayEyebrow()}
            title={isLoading ? 'Chargement…' : 'Aujourd\'hui'}
            titleVariant="displayIt"
            rightAction={
              <Pressable onPress={() => void fetchTodayEvents()}>
                <Icon name="Refresh" size={20} color={COLORS.textMuted} />
              </Pressable>
            }
          />

          {/* DayStrip */}
          <DayStrip selectedIndex={activeDay} onSelect={(idx) => {
            setActiveDay(idx);
            // Only fetch for today (index 3); other days need separate date param
            if (idx === 3) void fetchTodayEvents();
          }} />

          {/* Timeline / States */}
          {isNotConnected ? (
            <NotConnectedState
              onPress={() => router.push('/(tabs)/profile' as never)}
            />
          ) : (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.timelineContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.accent}
                />
              }
            >
              {events.length === 0 && !isLoading ? (
                <EmptyDayState
                  onAddEvent={() => router.push('/modals/add-event' as never)}
                />
              ) : (
                timeline.map((item) => {
                  if (item.kind === 'event') {
                    return (
                      <View key={item.event.id} style={styles.timelineRow}>
                        <View style={styles.timeGutter}>
                          <FDText variant="mono">{formatHHMM(item.event.start)}</FDText>
                        </View>
                        <EventCard
                          event={item.event}
                          style={styles.timelineCard}
                          onPress={() => {}}
                        />
                      </View>
                    );
                  }

                  return (
                    <View key={item.id} style={styles.timelineRow}>
                      <View style={styles.timeGutter}>
                        <FDText variant="mono" color={COLORS.textFaint}>
                          {item.startTime}
                        </FDText>
                      </View>
                      <View style={styles.timelineCard}>
                        <FreeSlotCard
                          startTime={item.startTime}
                          endTime={item.endTime}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>

        {/* FAB */}
        <FAB onPress={() => { router.push('/modals/add-event' as never); }} />
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

  // DayStrip
  dayStrip: {
    flexGrow: 0,
  },
  dayStripContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  } as ViewStyle,
  dayCell: {
    width: 44,
    height: 56,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  } as ViewStyle,
  dayCellActive: {
    backgroundColor: COLORS.accent,
  } as ViewStyle,

  // Timeline
  timelineContent: {
    paddingBottom: 120,
    paddingTop: SPACING.md,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  } as ViewStyle,
  timeGutter: {
    width: 44,
    paddingTop: SPACING.sm,
    flexShrink: 0,
  } as ViewStyle,
  timelineCard: {
    flex: 1,
    marginLeft: SPACING.sm,
  } as ViewStyle,

  // FreeSlotCard
  freeSlot: {
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.sm,
    gap: 2,
  } as ViewStyle,

  // NotConnectedState / EmptyDayState
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
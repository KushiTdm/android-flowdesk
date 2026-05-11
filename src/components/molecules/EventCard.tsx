import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADII, SPACING, SHADOWS, ANIMATION } from '@/constants/theme';
import type { CalendarEvent } from '@/src/types/event.types';
import { CALENDAR_COLORS } from '@/src/types/event.types';
import { FDText } from '../atoms/FDText';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
  style?: ViewStyle;
}

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 50;

function formatTimeRange(start: string, end: string): string {
  const fmt = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

const CALENDAR_LABEL: Record<string, string> = {
  travail: 'Travail',
  perso: 'Personnel',
  recrut: 'Recrutement',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventCard({ event, onPress, style }: EventCardProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, ANIMATION.springSnappy) }],
  }));

  const calendarColor = CALENDAR_COLORS[event.calendar] ?? COLORS.textMuted;
  const calendarLabel = CALENDAR_LABEL[event.calendar] ?? event.calendar;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = 0.97; }}
      onPressOut={() => { scale.value = 1; }}
      style={[animStyle, style]}
    >
      <BlurView
        intensity={BLUR_INTENSITY}
        tint="light"
        style={[
          styles.card,
          event.isCurrent === true && styles.cardCurrent,
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Left accent border */}
        <View style={[styles.leftBorder, { backgroundColor: calendarColor }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <FDText variant="eyebrow">{calendarLabel}</FDText>
            {event.isCurrent === true && (
              <View style={styles.currentDot} />
            )}
          </View>

          <FDText variant="bodyMedium" numberOfLines={2} style={styles.title}>
            {event.title}
          </FDText>

          {/* Time */}
          <View style={styles.metaRow}>
            <Icon name="Clock" size={12} color={COLORS.textFaint} />
            <FDText variant="caption">
              {formatTimeRange(event.start, event.end)}
            </FDText>

            {event.location !== undefined && (
              <>
                <FDText variant="caption" color={COLORS.textFaint}> · </FDText>
                <FDText variant="caption" numberOfLines={1}>{event.location}</FDText>
              </>
            )}
          </View>

          {/* Badges */}
          {(event.fromAI === true || event.attendees !== undefined) && (
            <View style={styles.badgeRow}>
              {event.fromAI === true && <Badge kind="ai">IA</Badge>}
              {event.attendees !== undefined && event.attendees.length > 0 && (
                <Badge kind="neutral">{`${event.attendees.length} participant${event.attendees.length > 1 ? 's' : ''}`}</Badge>
              )}
            </View>
          )}
        </View>
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    overflow: 'hidden',
    ...SHADOWS.sm,
  } as ViewStyle,
  cardCurrent: {
    backgroundColor: COLORS.infoSoft,
    borderColor: `rgba(80,140,230,0.18)`,
  } as ViewStyle,
  leftBorder: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: RADII.pill,
    marginVertical: SPACING.sm,
    marginLeft: SPACING.sm,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.xs,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,
  title: {
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 2,
  } as ViewStyle,
});

export default EventCard;

import React, { useEffect } from 'react';
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
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS, RADII, SPACING, SHADOWS, ANIMATION } from '@/constants/theme';
import type { Task } from '@/src/types/task.types';
import { FDText } from '../atoms/FDText';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';

interface TaskCardProps {
  task: Task;
  onCheck: () => void;
  onDelete: () => void;
  onPress?: () => void;
  compact?: boolean;
}

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 60;

export function TaskCard({
  task,
  onCheck,
  onDelete,
  onPress,
  compact = false,
}: TaskCardProps): React.ReactElement {
  const translateX = useSharedValue(0);
  const strikeWidth = useSharedValue(task.status === 'done' ? 1 : 0);
  const checkScale = useSharedValue(task.status === 'done' ? 1 : 0);

  useEffect(() => {
    if (task.status === 'done') {
      strikeWidth.value = withTiming(1, { duration: ANIMATION.standard });
      checkScale.value = withSpring(1, ANIMATION.springSnappy);
    } else {
      strikeWidth.value = withTiming(0, { duration: ANIMATION.standard });
      checkScale.value = withTiming(0, { duration: ANIMATION.quick });
    }
  }, [task.status]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-120, Math.min(120, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX <= -80) {
        translateX.value = withTiming(-400, { duration: 220 }, () =>
          runOnJS(onDelete)(),
        );
      } else if (e.translationX >= 80) {
        runOnJS(onCheck)();
        translateX.value = withSpring(0, ANIMATION.spring);
      } else {
        translateX.value = withSpring(0, ANIMATION.spring);
      }
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const strikeAnimStyle = useAnimatedStyle(() => ({
    opacity: strikeWidth.value,
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const isDone = task.status === 'done';
  const isUrgent = task.priority === 'urgent';
  const isDoing = task.priority === 'doing' || task.status === 'in_progress';
  const hasProgress = task.progress !== undefined && task.progress > 0;

  return (
    <View style={styles.outerWrapper}>
      {/* Reveal backgrounds */}
      <View style={styles.revealContainer}>
        <View style={[styles.revealSide, styles.revealLeft]}>
          <Icon name="Check" size={20} color={COLORS.bgBase} />
        </View>
        <View style={[styles.revealSide, styles.revealRight]}>
          <Icon name="Trash" size={20} color={COLORS.bgBase} />
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
          <Pressable onPress={onPress}>
            <BlurView
              intensity={BLUR_INTENSITY}
              tint="light"
              style={[styles.card, compact && styles.cardCompact]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.55)', 'transparent']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

              {/* Checkbox */}
              <Pressable
                onPress={onCheck}
                style={[
                  styles.checkbox,
                  isDone && styles.checkboxDone,
                ]}
              >
                <Animated.View style={checkAnimStyle}>
                  <Icon name="Check" size={13} color={COLORS.bgBase} strokeWidth={2.5} />
                </Animated.View>
              </Pressable>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <View style={styles.titleContainer}>
                    <FDText
                      variant="bodyMedium"
                      style={[isDone && styles.titleDone]}
                      numberOfLines={compact ? 1 : 2}
                    >
                      {task.title}
                    </FDText>
                    {/* Strikethrough overlay */}
                    <Animated.View
                      style={[styles.strike, strikeAnimStyle]}
                      pointerEvents="none"
                    />
                  </View>
                  {isUrgent && !compact && (
                    <Badge kind="urgent" style={styles.priorityBadge}>Urgent</Badge>
                  )}
                  {task.fromAI && !compact && (
                    <Badge kind="ai" style={styles.priorityBadge}>IA</Badge>
                  )}
                </View>

                {task.subtitle !== undefined && !compact && (
                  <FDText variant="caption" style={styles.subtitle} numberOfLines={1}>
                    {task.subtitle}
                  </FDText>
                )}

                {/* Metadata row */}
                {!compact && (
                  <View style={styles.metaRow}>
                    {task.dueDate !== undefined && (
                      <View style={styles.metaItem}>
                        <Icon name="Clock" size={11} color={COLORS.textFaint} />
                        <FDText variant="caption">{task.dueDate}</FDText>
                      </View>
                    )}
                    {task.tag !== undefined && (
                      <Badge kind={isDoing ? 'doing' : 'neutral'}>{task.tag}</Badge>
                    )}
                  </View>
                )}

                {/* Progress bar */}
                {hasProgress && !compact && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(task.progress ?? 0) * 100}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            </BlurView>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    marginBottom: SPACING.sm,
  } as ViewStyle,
  revealContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderRadius: RADII.md,
    overflow: 'hidden',
  } as ViewStyle,
  revealSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  revealLeft: {
    backgroundColor: COLORS.success,
    alignItems: 'flex-start',
    paddingLeft: SPACING.xl,
  } as ViewStyle,
  revealRight: {
    backgroundColor: COLORS.danger,
    alignItems: 'flex-end',
    paddingRight: SPACING.xl,
  } as ViewStyle,
  cardWrapper: {
    borderRadius: RADII.md,
    overflow: 'hidden',
  } as ViewStyle,
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    gap: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    overflow: 'hidden',
    ...SHADOWS.sm,
  } as ViewStyle,
  cardCompact: {
    padding: SPACING.sm,
  } as ViewStyle,
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: `rgba(110,114,255,0.35)`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  } as ViewStyle,
  checkboxDone: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  } as ViewStyle,
  content: {
    flex: 1,
    gap: SPACING.xs,
  } as ViewStyle,
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  } as ViewStyle,
  titleContainer: {
    flex: 1,
    position: 'relative',
  } as ViewStyle,
  titleDone: {
    color: COLORS.textFaint,
  },
  strike: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: COLORS.textFaint,
    marginTop: -0.75,
  } as ViewStyle,
  priorityBadge: {
    flexShrink: 0,
    marginTop: 1,
  } as ViewStyle,
  subtitle: {
    marginTop: -2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  } as ViewStyle,
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  } as ViewStyle,
  progressTrack: {
    height: 2,
    backgroundColor: COLORS.hairline,
    borderRadius: RADII.pill,
    overflow: 'hidden',
    marginTop: 2,
  } as ViewStyle,
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADII.pill,
  } as ViewStyle,
});

export default TaskCard;

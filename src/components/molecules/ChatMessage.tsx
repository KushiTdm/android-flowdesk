import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import type { ChatMessage as ChatMessageType } from '@/src/types/ai-intent.types';
import { FDText } from '../atoms/FDText';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

interface ChatMessageProps {
  message: ChatMessageType;
  style?: ViewStyle;
}

function BlinkingCursor(): React.ReactElement {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      -1,
      true,
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.cursor, cursorStyle]}
    />
  );
}

function SparkleIcon(): React.ReactElement {
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.5, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={sparkleStyle}>
      <Icon name="Sparkle" size={22} color={COLORS.accent} />
    </Animated.View>
  );
}

export function ChatMessage({ message, style }: ChatMessageProps): React.ReactElement {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={[styles.userWrapper, style]}>
        <View style={styles.userBubble}>
          <FDText variant="body" style={styles.userText}>
            {message.text}
          </FDText>
          <FDText variant="mono" style={styles.timeCaption}>
            {message.time}
          </FDText>
        </View>
      </View>
    );
  }

  // Assistant message
  return (
    <View style={[styles.assistantWrapper, style]}>
      <SparkleIcon />

      <View style={styles.assistantBubble}>
        <View style={styles.assistantTextRow}>
          <FDText variant="body" style={styles.assistantText}>
            {message.text}
          </FDText>
          {message.streaming === true && <BlinkingCursor />}
        </View>

        {message.hasActions === true && message.streaming !== true && (
          <View style={styles.actionsRow}>
            <Button
              variant="ai"
              size="sm"
              onPress={() => { /* handled by parent */ }}
            >
              Sauvegarder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => { /* handled by parent */ }}
              icon={<Icon name="Refresh" size={14} color={COLORS.textMuted} />}
            >
              Regénérer
            </Button>
          </View>
        )}

        <FDText variant="mono" style={styles.assistantTime}>
          {message.time}
        </FDText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // User message
  userWrapper: {
    alignItems: 'flex-end',
    paddingLeft: SPACING.xxl,
  } as ViewStyle,
  userBubble: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    maxWidth: '85%',
  } as ViewStyle,
  userText: {
    color: COLORS.text,
  },
  timeCaption: {
    marginTop: 4,
    textAlign: 'right',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textFaint,
  },

  // Assistant message
  assistantWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingRight: SPACING.xxl,
  } as ViewStyle,
  assistantBubble: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  } as ViewStyle,
  assistantTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  } as ViewStyle,
  assistantText: {
    flex: 1,
    color: COLORS.text,
  },
  cursor: {
    width: 2,
    height: 14,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
    marginLeft: 2,
    marginBottom: 2,
  } as ViewStyle,
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  } as ViewStyle,
  assistantTime: {
    marginTop: 4,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textFaint,
  },
});

export default ChatMessage;

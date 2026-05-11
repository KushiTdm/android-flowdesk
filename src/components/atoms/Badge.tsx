import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII } from '@/constants/theme';
import { FDText } from './FDText';

export type BadgeKind = 'urgent' | 'doing' | 'done' | 'info' | 'ai' | 'neutral';

interface BadgeProps {
  kind: BadgeKind;
  children?: React.ReactNode;
  style?: ViewStyle;
}

interface BadgeStyle {
  bg: string;
  textColor: string;
}

const KIND_STYLES: Record<BadgeKind, BadgeStyle> = {
  urgent: {
    bg: COLORS.dangerSoft,
    textColor: COLORS.dangerText,
  },
  doing: {
    bg: COLORS.accentMist,
    textColor: COLORS.accent,
  },
  done: {
    bg: COLORS.successSoft,
    textColor: COLORS.successText,
  },
  info: {
    bg: COLORS.infoSoft,
    textColor: COLORS.infoText,
  },
  ai: {
    bg: COLORS.accentGlow,
    textColor: COLORS.accent,
  },
  neutral: {
    bg: COLORS.hairline,
    textColor: COLORS.textMuted,
  },
};

// Inline sparkle shape for the 'ai' badge
function SparkleIcon(): React.ReactElement {
  return (
    <View style={styles.sparkle}>
      <View style={styles.sparkleV} />
      <View style={styles.sparkleH} />
    </View>
  );
}

export function Badge({ kind, children, style }: BadgeProps): React.ReactElement {
  const { bg, textColor } = KIND_STYLES[kind];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      {kind === 'ai' && <SparkleIcon />}
      <FDText style={[styles.text, { color: textColor }]}>
        {children}
      </FDText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADII.pill,
    gap: 4,
  } as ViewStyle,
  text: {
    fontFamily: TYPOGRAPHY.uiMedium,
    fontSize: 10.5,
    letterSpacing: 0.4,
  } as TextStyle,
  sparkle: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  sparkleV: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: COLORS.accent,
    borderRadius: RADII.pill,
  } as ViewStyle,
  sparkleH: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: RADII.pill,
  } as ViewStyle,
});

export default Badge;

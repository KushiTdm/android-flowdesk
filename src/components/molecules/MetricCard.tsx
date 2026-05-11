import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADII, SPACING, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '../atoms/FDText';

type MetricTone = 'accent' | 'info' | 'danger';

interface MetricCardProps {
  value: number | string;
  label: string;
  tone?: MetricTone;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const TONE_COLOR: Record<MetricTone, string> = {
  accent: COLORS.accent,
  info: COLORS.info,
  danger: COLORS.danger,
};

const TONE_BG: Record<MetricTone, string> = {
  accent: COLORS.accentMist,
  info: COLORS.infoSoft,
  danger: COLORS.dangerSoft,
};

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 50;

export function MetricCard({
  value,
  label,
  tone = 'accent',
  icon,
  style,
}: MetricCardProps): React.ReactElement {
  const toneColor = TONE_COLOR[tone];
  const toneBg = TONE_BG[tone];

  return (
    <BlurView
      intensity={BLUR_INTENSITY}
      tint="light"
      style={[styles.card, style]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.55)', 'transparent']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top row: icon + tint background dot */}
      {icon !== undefined && (
        <View style={[styles.iconContainer, { backgroundColor: toneBg }]}>
          {icon}
        </View>
      )}

      {/* Value */}
      <FDText
        variant="mono"
        size={TYPOGRAPHY.xl}
        color={toneColor}
        style={styles.value}
      >
        {String(value)}
      </FDText>

      {/* Label */}
      <FDText variant="eyebrow" style={styles.label}>
        {label}
      </FDText>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    padding: SPACING.md,
    overflow: 'hidden',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  } as ViewStyle,
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  } as ViewStyle,
  value: {
    includeFontPadding: false,
  },
  label: {
    marginTop: 2,
  },
});

export default MetricCard;

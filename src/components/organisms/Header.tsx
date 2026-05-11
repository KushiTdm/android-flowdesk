import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';
import { FDText } from '../atoms/FDText';
import type { FDTextVariant } from '../atoms/FDText';

interface HeaderProps {
  eyebrow?: string;
  title: string;
  titleVariant?: 'display' | 'displayIt' | 'body';
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({
  eyebrow,
  title,
  titleVariant = 'displayIt',
  subtitle,
  rightAction,
  style,
}: HeaderProps): React.ReactElement {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftBlock}>
        {eyebrow !== undefined && (
          <FDText variant="eyebrow" style={styles.eyebrow}>
            {eyebrow}
          </FDText>
        )}
        <FDText variant={titleVariant as FDTextVariant} style={styles.title}>
          {title}
        </FDText>
        {subtitle !== undefined && (
          <FDText variant="caption" style={styles.subtitle}>
            {subtitle}
          </FDText>
        )}
      </View>

      {rightAction !== undefined && (
        <View style={styles.rightAction}>{rightAction}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    paddingBottom: SPACING.sm,
  } as ViewStyle,
  leftBlock: {
    flex: 1,
    gap: 2,
  } as ViewStyle,
  eyebrow: {
    marginBottom: 2,
  },
  title: {
    // variant handles font
  },
  subtitle: {
    marginTop: 2,
    color: COLORS.textMuted,
  },
  rightAction: {
    marginLeft: SPACING.md,
    flexShrink: 0,
  } as ViewStyle,
});

export default Header;

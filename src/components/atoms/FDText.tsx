import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';

export type FDTextVariant =
  | 'display'
  | 'displayIt'
  | 'eyebrow'
  | 'label'
  | 'body'
  | 'bodyMedium'
  | 'mono'
  | 'caption';

interface FDTextProps {
  variant?: FDTextVariant;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
}

const variantStyles: Record<FDTextVariant, TextStyle> = {
  display: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: TYPOGRAPHY.displaySize,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.displaySize * 1.15,
  },
  displayIt: {
    fontFamily: TYPOGRAPHY.displayIt,
    fontSize: TYPOGRAPHY.displaySize,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.displaySize * 1.15,
  },
  eyebrow: {
    fontFamily: TYPOGRAPHY.ui,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  label: {
    fontFamily: TYPOGRAPHY.uiMedium,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: {
    fontFamily: TYPOGRAPHY.ui,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.base * 1.5,
  },
  bodyMedium: {
    fontFamily: TYPOGRAPHY.uiMedium,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.base * 1.5,
  },
  mono: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  caption: {
    fontFamily: TYPOGRAPHY.ui,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textFaint,
    lineHeight: TYPOGRAPHY.xs * 1.4,
  },
};

export function FDText({
  variant = 'body',
  size,
  color,
  align,
  style,
  children,
  numberOfLines,
}: FDTextProps): React.ReactElement {
  const base = variantStyles[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        base,
        size !== undefined && { fontSize: size },
        color !== undefined && { color },
        align !== undefined && { textAlign: align },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export default FDText;

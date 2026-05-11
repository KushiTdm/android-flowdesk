import React from 'react';
import {
  Pressable,
  View,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, RADII, ANIMATION } from '@/constants/theme';
import { FDText } from './FDText';

export type ButtonVariant = 'primary' | 'secondary' | 'ai' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  onPress: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  size?: ButtonSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  loading?: boolean;
}

interface VariantStyle {
  bg: string;
  border?: string;
  textColor: string;
}

const VARIANT_STYLES: Record<ButtonVariant, VariantStyle> = {
  primary: {
    bg: COLORS.accent,
    textColor: COLORS.bgDeep,
  },
  secondary: {
    bg: 'transparent',
    border: COLORS.accent,
    textColor: COLORS.accent,
  },
  ai: {
    bg: COLORS.accentMist,
    border: COLORS.accentGlow,
    textColor: COLORS.accent,
  },
  danger: {
    bg: COLORS.dangerSoft,
    textColor: COLORS.dangerText,
  },
  ghost: {
    bg: 'transparent',
    textColor: COLORS.textMuted,
  },
};

const SIZE_STYLES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: TYPOGRAPHY.sm },
  md: { paddingVertical: 12, paddingHorizontal: 22, fontSize: TYPOGRAPHY.base },
  lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: TYPOGRAPHY.md },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = 'primary',
  onPress,
  children,
  disabled = false,
  size = 'md',
  icon,
  style,
  loading = false,
}: ButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, ANIMATION.springSnappy) }],
  }));

  const { bg, border, textColor } = VARIANT_STYLES[variant];
  const { paddingVertical, paddingHorizontal, fontSize } = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    backgroundColor: bg,
    paddingVertical,
    paddingHorizontal,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: disabled ? 0.48 : 1,
    ...(border && {
      borderWidth: 1,
      borderColor: border,
    }),
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => { scale.value = 0.96; }}
      onPressOut={() => { scale.value = 1; }}
      style={[animStyle, style]}
    >
      <View style={containerStyle}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {icon}
            {children !== undefined && (
              <FDText
                style={{
                  fontFamily: TYPOGRAPHY.uiSemiBold,
                  fontSize,
                  color: textColor,
                }}
              >
                {children}
              </FDText>
            )}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

export default Button;

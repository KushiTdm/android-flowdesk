import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, RADII, SPACING, ANIMATION } from '@/constants/theme';
import { FDText } from './FDText';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  label?: string;
  style?: ViewStyle;
  maxLength?: number;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  rightElement,
  label,
  style,
  maxLength,
  onSubmitEditing,
  autoFocus = false,
}: InputProps): React.ReactElement {
  const focusProgress = useSharedValue(0);

  const borderAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [COLORS.hairline, `rgba(110,114,255,0.5)`],
    ),
    shadowOpacity: focusProgress.value * 0.15,
    shadowRadius: focusProgress.value * 8,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      {label !== undefined && (
        <FDText variant="label" style={styles.label}>
          {label}
        </FDText>
      )}
      <Animated.View style={[styles.container, borderAnimStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textFaint}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          onFocus={() => {
            focusProgress.value = withTiming(1, { duration: ANIMATION.standard });
          }}
          onBlur={() => {
            focusProgress.value = withTiming(0, { duration: ANIMATION.standard });
          }}
          style={[
            styles.input,
            multiline && styles.multiline,
          ]}
        />
        {rightElement !== undefined && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,
  } as ViewStyle,
  label: {
    marginBottom: 2,
  } as TextStyle,
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  } as ViewStyle,
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.ui,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.text,
    padding: 0,
    margin: 0,
  } as TextStyle,
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  } as TextStyle,
  rightElement: {
    marginLeft: SPACING.sm,
  } as ViewStyle,
});

export default Input;

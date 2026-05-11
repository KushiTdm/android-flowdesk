import React, { useEffect } from 'react';
import {
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
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, RADII, SHADOWS, ANIMATION } from '@/constants/theme';
import { Icon } from '../atoms/Icon';

interface FABProps {
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 60;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ onPress, icon, style }: FABProps): React.ReactElement {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-3, {
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
  }, []);

  const floatAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: withSpring(scale.value, ANIMATION.springSnappy) },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = 0.92; }}
      onPressOut={() => { scale.value = 1; }}
      style={[styles.fab, floatAnimStyle, style]}
    >
      <BlurView
        intensity={BLUR_INTENSITY}
        tint="light"
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {icon ?? (
          <Icon name="Plus" size={24} color={COLORS.bgBase} strokeWidth={2} />
        )}
      </BlurView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 92,
    width: 56,
    height: 56,
    borderRadius: RADII.pill,
    ...SHADOWS.lg,
  } as ViewStyle,
  blurContainer: {
    width: 56,
    height: 56,
    borderRadius: RADII.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
});

export default FAB;

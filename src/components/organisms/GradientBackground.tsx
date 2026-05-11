import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({
  children,
  style,
}: GradientBackgroundProps): React.ReactElement {
  const drift1X = useSharedValue(0);
  const drift1Y = useSharedValue(0);
  const drift2X = useSharedValue(0);
  const drift2Y = useSharedValue(0);

  useEffect(() => {
    // Orb 1 drift
    drift1X.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 8000 }),
        withTiming(-8, { duration: 8000 }),
        withTiming(0, { duration: 8000 }),
      ),
      -1,
      true,
    );
    drift1Y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 7000 }),
        withTiming(6, { duration: 7000 }),
        withTiming(0, { duration: 7000 }),
      ),
      -1,
      true,
    );

    // Orb 2 drift (offset timing)
    drift2X.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 9000 }),
        withTiming(8, { duration: 9000 }),
        withTiming(0, { duration: 9000 }),
      ),
      -1,
      true,
    );
    drift2Y.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 8500 }),
        withTiming(-6, { duration: 8500 }),
        withTiming(0, { duration: 8500 }),
      ),
      -1,
      true,
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift1X.value },
      { translateY: drift1Y.value },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift2X.value },
      { translateY: drift2Y.value },
    ],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Main gradient */}
      <LinearGradient
        colors={[COLORS.bgDeep, COLORS.bgBase]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orb 1 — violet */}
      <Animated.View style={[styles.orb1, orb1Style]} />

      {/* Floating orb 2 — info/blue */}
      <Animated.View style={[styles.orb2, orb2Style]} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: -50,
    right: -80,
    backgroundColor: COLORS.accent,
    opacity: 0.06,
    borderRadius: 150,
  } as ViewStyle,
  orb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    bottom: 150,
    left: -60,
    backgroundColor: COLORS.info,
    opacity: 0.04,
    borderRadius: 125,
  } as ViewStyle,
});

export default GradientBackground;

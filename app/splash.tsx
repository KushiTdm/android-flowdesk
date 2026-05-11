// ---------------------------------------------------------------------------
// app/splash.tsx — Écran splash/onboarding (premier lancement)
// ---------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { View, ViewStyle, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, SHADOWS } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Button } from '@/src/components/atoms/Button';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';

// ---------------------------------------------------------------------------
// LogoMark
// ---------------------------------------------------------------------------

function LogoMark(): React.ReactElement {
  return (
    <Image
      source={require('@/assets/images/FlowDesk_logo.png')}
      style={{
        width: 120,
        height: 120,
        resizeMode: 'contain',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// SplashScreen
// ---------------------------------------------------------------------------

export default function SplashScreen(): React.ReactElement {
  const router = useRouter();

  // Phase 1 (0ms) — logo + titre
  const phase1Opacity = useSharedValue(0);
  const phase1Y = useSharedValue(8);

  // Phase 2 (600ms) — tagline
  const phase2Opacity = useSharedValue(0);
  const phase2Y = useSharedValue(8);

  // Phase 3 (1200ms) — CTAs
  const phase3Opacity = useSharedValue(0);
  const phase3Y = useSharedValue(8);

  useEffect(() => {
    // Phase 1
    phase1Opacity.value = withTiming(1, { duration: 700 });
    phase1Y.value = withSpring(0, { damping: 18, stiffness: 180 });

    // Phase 2
    phase2Opacity.value = withDelay(600, withTiming(1, { duration: 700 }));
    phase2Y.value = withDelay(600, withSpring(0, { damping: 18, stiffness: 180 }));

    // Phase 3
    phase3Opacity.value = withDelay(1200, withTiming(1, { duration: 700 }));
    phase3Y.value = withDelay(1200, withSpring(0, { damping: 18, stiffness: 180 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase1Style = useAnimatedStyle(() => ({
    opacity: phase1Opacity.value,
    transform: [{ translateY: phase1Y.value }],
  }));

  const phase2Style = useAnimatedStyle(() => ({
    opacity: phase2Opacity.value,
    transform: [{ translateY: phase2Y.value }],
  }));

  const phase3Style = useAnimatedStyle(() => ({
    opacity: phase3Opacity.value,
    transform: [{ translateY: phase3Y.value }],
  }));

  function handleStart(): void {
    router.replace('/(tabs)');
  }

  return (
    <GradientBackground style={{ flex: 1 }}>
      {/* Glow radial derrière le logo */}
      <View
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          backgroundColor: COLORS.accentGlow,
          borderRadius: 100,
          opacity: 0.6,
        } satisfies ViewStyle}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
        } satisfies ViewStyle}
      >
        {/* Phase 1 : Logo */}
        <Animated.View style={[{ alignItems: 'center' }, phase1Style]}>
          <LogoMark />
          <FDText
            variant="displayIt"
            size={40}
            style={{ marginTop: SPACING.md }}
          >
            FlowDesk
          </FDText>
        </Animated.View>

        {/* Phase 2 : Tagline */}
        <Animated.View style={phase2Style}>
          <FDText
            variant="body"
            align="center"
            color={COLORS.textMuted}
            style={{ marginTop: SPACING.lg, maxWidth: 260 }}
          >
            Votre assistant de productivité intelligent
          </FDText>
        </Animated.View>

        {/* Phase 3 : CTAs */}
        <Animated.View style={[{ width: '100%' }, phase3Style]}>
          <View
            style={{
              marginTop: SPACING.xxl,
              width: '100%',
              gap: SPACING.md,
            } satisfies ViewStyle}
          >
            <Button
              variant="primary"
              onPress={handleStart}
              style={{ width: '100%' }}
            >
              Commencer
            </Button>
            <Button
              variant="secondary"
              onPress={handleStart}
              style={{ width: '100%' }}
            >
              J&apos;ai déjà un compte
            </Button>
          </View>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

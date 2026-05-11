import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, RADII, SHADOWS, ANIMATION } from '@/constants/theme';
import { Icon } from '../atoms/Icon';
import type { IconName } from '../atoms/Icon';

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 80;

const ROUTE_ICON: Record<string, IconName> = {
  index: 'Home',
  agenda: 'Calendar',
  tasks: 'Tasks',
  assistant: 'Chat',
  profile: 'Profile',
};

interface TabItemProps {
  iconName: IconName;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ iconName, isActive, onPress }: TabItemProps): React.ReactElement {
  const scale = useSharedValue(isActive ? 1 : 0.88);
  const translateY = useSharedValue(isActive ? -1 : 0);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.88, ANIMATION.springSnappy);
    translateY.value = withSpring(isActive ? -1 : 0, ANIMATION.springSnappy);
    dotOpacity.value = withTiming(isActive ? 1 : 0, { duration: ANIMATION.standard });
  }, [isActive]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const dotAnimStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, iconAnimStyle]}>
        <Icon
          name={iconName}
          size={24}
          color={isActive ? COLORS.accent : COLORS.textMuted}
          strokeWidth={isActive ? 2 : 1.5}
        />
      </Animated.View>
      <Animated.View style={[styles.dot, dotAnimStyle]} />
    </Pressable>
  );
}

export function CustomTabBar({
  state,
  descriptors: _descriptors,
  navigation,
}: BottomTabBarProps): React.ReactElement {
  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <BlurView
        intensity={BLUR_INTENSITY}
        tint="light"
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isActive = state.index === index;
            const iconName: IconName = ROUTE_ICON[route.name] ?? 'Home';

            return (
              <TabItem
                key={route.key}
                iconName={iconName}
                isActive={isActive}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isActive && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
      <SafeAreaView edges={['bottom']} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  } as ViewStyle,
  blurContainer: {
    borderRadius: RADII.pill,
    height: 60,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  } as ViewStyle,
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
  } as ViewStyle,
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 4,
  } as ViewStyle,
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  } as ViewStyle,
});

export default CustomTabBar;

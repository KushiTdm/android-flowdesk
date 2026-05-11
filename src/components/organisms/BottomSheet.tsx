import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS, RADII, SPACING, SHADOWS, ANIMATION } from '@/constants/theme';
import { FDText } from '../atoms/FDText';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapHeight?: number | `${number}%`;
  children: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BACKDROP_BLUR_INTENSITY = Platform.OS === 'android' ? 5 : 8;

export function BottomSheet({
  isOpen,
  onClose,
  title,
  snapHeight = '68%',
  children,
}: BottomSheetProps): React.ReactElement {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const computedHeight =
    typeof snapHeight === 'string' && snapHeight.endsWith('%')
      ? (SCREEN_HEIGHT * parseFloat(snapHeight)) / 100
      : (snapHeight as number);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(0, ANIMATION.spring);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 });
    }
  }, [isOpen]);

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 800) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 }, () =>
          runOnJS(onClose)(),
        );
      } else {
        translateY.value = withSpring(0, ANIMATION.spring);
      }
    });

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropOpacityStyle]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <BlurView
          intensity={BACKDROP_BLUR_INTENSITY}
          tint="light"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: computedHeight },
          sheetAnimStyle,
        ]}
      >
        <GestureDetector gesture={dragGesture}>
          <View style={styles.dragArea}>
            {/* Grip handle */}
            <View style={styles.handle} />

            {/* Title */}
            {title !== undefined && (
              <FDText variant="bodyMedium" style={styles.title}>
                {title}
              </FDText>
            )}
          </View>
        </GestureDetector>

        <SafeAreaView edges={['bottom']} style={styles.contentArea}>
          {children}
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.overlay,
  } as ViewStyle,
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgBase,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  } as ViewStyle,
  dragArea: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  } as ViewStyle,
  handle: {
    width: 38,
    height: 4,
    backgroundColor: COLORS.hairline,
    borderRadius: RADII.pill,
    marginBottom: SPACING.sm,
  } as ViewStyle,
  title: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  contentArea: {
    flex: 1,
  } as ViewStyle,
});

export default BottomSheet;

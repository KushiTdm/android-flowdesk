import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADII, SPACING, ANIMATION } from '@/constants/theme';
import { FDText } from '../atoms/FDText';
import { StatusDot } from '../atoms/StatusDot';
import { Icon } from '../atoms/Icon';

type ConnectionStatus = 'ok' | 'err' | 'off';

interface IntegrationRowProps {
  iconBg: string;
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  status: ConnectionStatus;
  onPress?: () => void;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  ok: 'Connecté',
  err: 'Erreur',
  off: 'Non configuré',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IntegrationRow({
  iconBg,
  icon,
  name,
  subtitle,
  status,
  onPress,
}: IntegrationRowProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, ANIMATION.springSnappy) }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = 0.97; }}
      onPressOut={() => { scale.value = 1; }}
      style={animStyle}
    >
      <View style={styles.row}>
        {/* Icon box */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          {icon}
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <FDText variant="bodyMedium">{name}</FDText>
          <FDText variant="caption">{subtitle}</FDText>
        </View>

        {/* Status */}
        <View style={styles.statusBlock}>
          <StatusDot status={status} size={7} />
          <FDText
            variant="caption"
            color={
              status === 'ok'
                ? COLORS.successText
                : status === 'err'
                ? COLORS.dangerText
                : COLORS.textFaint
            }
          >
            {STATUS_LABEL[status]}
          </FDText>
        </View>

        <Icon name="ChevronRight" size={16} color={COLORS.textFaint} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  } as ViewStyle,
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as ViewStyle,
  textBlock: {
    flex: 1,
    gap: 1,
  } as ViewStyle,
  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  } as ViewStyle,
});

export default IntegrationRow;

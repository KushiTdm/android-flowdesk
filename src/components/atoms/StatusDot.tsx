import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

type DotStatus = 'ok' | 'err' | 'off';

interface StatusDotProps {
  status: DotStatus;
  size?: number;
}

const STATUS_COLOR: Record<DotStatus, string> = {
  ok: COLORS.success,
  err: COLORS.danger,
  off: COLORS.textFaint,
};

export function StatusDot({ status, size = 7 }: StatusDotProps): React.ReactElement {
  const color = STATUS_COLOR[status];

  const dotStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    ...(status === 'ok' && {
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 3,
    }),
  };

  return <View style={dotStyle} />;
}

export default StatusDot;

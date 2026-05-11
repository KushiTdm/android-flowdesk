import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/theme';
import { FDText } from './FDText';

type AvatarTone = 'accent' | 'muted' | 'surface';

interface AvatarProps {
  initials: string;
  size?: number;
  tone?: AvatarTone;
  style?: ViewStyle;
}

export function Avatar({
  initials,
  size = 36,
  tone = 'accent',
  style,
}: AvatarProps): React.ReactElement {
  const fontSize = size * 0.36;
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (tone === 'accent') {
    return (
      <LinearGradient
        colors={['#8B8EFF', COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[containerStyle, style]}
      >
        <FDText
          variant="bodyMedium"
          size={fontSize}
          color={COLORS.bgBase}
          style={styles.initialsText}
        >
          {initials.toUpperCase()}
        </FDText>
      </LinearGradient>
    );
  }

  const bgColor =
    tone === 'muted' ? 'rgba(160,158,184,0.18)' : COLORS.bgSurface;
  const textColor =
    tone === 'muted' ? COLORS.textMuted : COLORS.textFaint;

  return (
    <View style={[containerStyle, { backgroundColor: bgColor }, style]}>
      <FDText
        variant="bodyMedium"
        size={fontSize}
        color={textColor}
        style={styles.initialsText}
      >
        {initials.toUpperCase()}
      </FDText>
    </View>
  );
}

const styles = StyleSheet.create({
  initialsText: {
    includeFontPadding: false,
  },
});

export default Avatar;

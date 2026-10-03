import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, withAlpha } from '@/constants/theme';

type PropsType = {
  accessibilityLabel?: string;
  color?: string;
  disabled?: boolean;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  title: string;
  variant?: 'contained' | 'outline' | 'soft' | 'ghost';
};

const ZButton = ({
  accessibilityLabel,
  color = colors.primary,
  disabled,
  icon,
  onPress,
  size = 'md',
  style,
  title,
  variant = 'contained',
}: PropsType) => {
  const textColor = variant === 'contained' ? colors.onPrimary : color;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.button,
        size === 'lg' && styles.large,
        variant === 'contained' && [{ backgroundColor: color }, shadows.sm],
        variant === 'outline' && { borderColor: color, borderWidth: 1.5 },
        variant === 'soft' && { backgroundColor: withAlpha(color, 0.1) },
        (hovered || pressed) && styles.hovered,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && <MaterialIcons color={textColor} name={icon} size={size === 'lg' ? 20 : 18} />}
      <Text style={[styles.text, size === 'lg' && styles.largeText, { color: textColor }]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  large: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  hovered: {
    opacity: 0.9,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 16,
  },
});

export default ZButton;

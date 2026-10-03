import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, withAlpha } from '@/constants/theme';

type PropsType = {
  accessibilityLabel?: string;
  color?: string;
  name: ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  size?: number;
  variant?: 'plain' | 'soft';
};

const ZIconButton = ({
  accessibilityLabel,
  color = colors.text,
  name,
  onPress,
  size = 20,
  variant = 'plain',
}: PropsType) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.button,
        variant === 'soft' && { backgroundColor: withAlpha(color, 0.08) },
        (hovered || pressed) && { backgroundColor: withAlpha(color, 0.15) },
      ]}
    >
      <MaterialIcons color={color} name={name} size={size} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.round,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});

export default ZIconButton;

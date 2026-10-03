import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, withAlpha } from '@/constants/theme';

type PropsType = {
  color?: string;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
};

const ZBadge = ({ color = colors.primary, icon, label }: PropsType) => {
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.1) }]}>
      {icon && <MaterialIcons color={color} name={icon} size={14} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ZBadge;

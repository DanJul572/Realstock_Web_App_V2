import { StyleSheet, Text, View } from 'react-native';

import { breakAll, colors, radius, spacing } from '@/constants/theme';

type ItemType = {
  label: string;
  monospace?: boolean;
  value: string | null | undefined;
};

// Label / value rows; long values wrap instead of being cut off. Monospace
// values (URLs, class names) go under their label so they get the full width.
const ZInfoList = ({ items }: { items: ItemType[] }) => (
  <View style={styles.list}>
    {items.map((item, index) => (
      <View
        key={item.label}
        style={[styles.row, item.monospace && styles.stacked, index > 0 && styles.divider]}
      >
        <Text style={styles.label}>{item.label}</Text>
        <Text selectable style={[styles.value, item.monospace && styles.monospace]}>
          {item.value || '-'}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  stacked: {
    flexDirection: 'column',
    gap: spacing.xxs,
  },
  divider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  label: {
    color: colors.textMuted,
    flexShrink: 0,
    fontSize: 13,
  },
  value: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  monospace: {
    ...breakAll,
    fontFamily: 'monospace',
    fontWeight: '500',
    textAlign: 'left',
  },
});

export default ZInfoList;

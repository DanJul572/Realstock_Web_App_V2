import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  gradient,
  gradients,
  radius,
  shadows,
  spacing,
  typography,
  withAlpha,
} from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import translator from '@/lib/translator';

type MenuItemType = {
  adminOnly?: boolean;
  color: string;
  href: Href;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  isHighlighted?: boolean;
  label: string;
};

const menuItems: MenuItemType[] = [
  {
    color: colors.primary,
    href: '/scan',
    icon: 'qr-code-scanner',
    isHighlighted: true,
    label: translator('scan_code'),
  },
  {
    color: colors.primary,
    href: '/product',
    icon: 'inventory-2',
    label: translator('check_stock'),
  },
  {
    adminOnly: true,
    color: colors.success,
    href: '/transaction/form',
    icon: 'point-of-sale',
    label: translator('new_transaction'),
  },
  {
    adminOnly: true,
    color: colors.warning,
    href: '/product/form',
    icon: 'add-box',
    label: translator('add_product'),
  },
];

// Quick actions only. Pages are reached through the tabs; master data and
// admin pages sit in the More tab.
const DashboardMenu = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const items = menuItems.filter((item) => isAdmin || !item.adminOnly);
  const tileWidth = `${100 / items.length}%` as const;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{translator('quick_actions')}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.label}
            onPress={() => router.navigate(item.href)}
            style={({ hovered, pressed }) => [
              styles.tile,
              { width: tileWidth },
              (hovered || pressed) && styles.tilePressed,
            ]}
          >
            <View
              style={[
                styles.icon,
                item.isHighlighted
                  ? [gradient(gradients.primary), shadows.lg]
                  : { backgroundColor: withAlpha(item.color, 0.12) },
              ]}
            >
              <MaterialIcons
                color={item.isHighlighted ? colors.onPrimary : item.color}
                name={item.icon}
                size={item.isHighlighted ? 30 : 26}
              />
            </View>
            <Text
              numberOfLines={2}
              style={[styles.label, item.isHighlighted && styles.labelHighlighted]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  tile: {
    alignItems: 'center',
    borderRadius: radius.lg,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tilePressed: {
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelHighlighted: {
    color: colors.primary,
    fontWeight: '800',
  },
});

export default DashboardMenu;

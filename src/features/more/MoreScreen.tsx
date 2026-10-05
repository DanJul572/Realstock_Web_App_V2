import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import {
  colors,
  contentMaxWidth,
  radius,
  shadows,
  spacing,
  typography,
  withAlpha,
} from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import useLogout from '@/features/auth/useLogout';
import useBottomInset from '@/hooks/useBottomInset';
import translator from '@/lib/translator';

type MenuItemType = {
  color: string;
  href: Href;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
};

type MenuGroupType = {
  items: MenuItemType[];
  title: string;
};

// Pages that are opened rarely: master data and system logs (admin only).
const adminGroups: MenuGroupType[] = [
  {
    items: [
      { color: colors.info, href: '/category', icon: 'category', label: translator('category') },
      { color: colors.error, href: '/user', icon: 'group', label: translator('user') },
    ],
    title: translator('master_data'),
  },
  {
    items: [
      {
        color: colors.primaryDark,
        href: '/audit',
        icon: 'history',
        label: translator('audit_trail'),
      },
      {
        color: colors.error,
        href: '/error-log',
        icon: 'bug-report',
        label: translator('error_log'),
      },
    ],
    title: translator('system'),
  },
];

const MoreScreen = () => {
  const router = useRouter();
  const { isAdmin, session } = useAuth();
  const logout = useLogout();
  const bottomInset = useBottomInset();
  const username = session?.name ?? '';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + bottomInset }]}
      style={styles.screen}
    >
      <View style={[styles.card, styles.profile]}>
        <ZAvatar name={username} shape="circle" size={52} />
        <View style={styles.profileText}>
          <Text numberOfLines={1} style={styles.name}>
            {username}
          </Text>
          <ZBadge
            color={isAdmin ? colors.primary : colors.info}
            icon={isAdmin ? 'verified-user' : 'person'}
            label={isAdmin ? 'Admin' : 'User'}
          />
        </View>
      </View>

      {isAdmin &&
        adminGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.card}>
              {group.items.map((item, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.label}
                  onPress={() => router.push(item.href)}
                  style={({ hovered, pressed }) => [
                    styles.row,
                    index > 0 && styles.rowDivider,
                    (hovered || pressed) && styles.rowPressed,
                  ]}
                >
                  <View style={[styles.icon, { backgroundColor: withAlpha(item.color, 0.12) }]}>
                    <MaterialIcons color={item.color} name={item.icon} size={22} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <MaterialIcons color={colors.textSubtle} name="chevron-right" size={24} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

      <View style={styles.group}>
        <Text style={styles.groupTitle}>{translator('account')}</Text>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            onPress={logout}
            style={({ hovered, pressed }) => [
              styles.row,
              (hovered || pressed) && { backgroundColor: colors.errorSoft },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: colors.errorSoft }]}>
              <MaterialIcons color={colors.error} name="logout" size={22} />
            </View>
            <Text style={[styles.rowLabel, styles.logoutText]}>{translator('logout')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  card: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  rowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowLabel: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
  },
  logoutText: {
    color: colors.error,
  },
});

export default MoreScreen;

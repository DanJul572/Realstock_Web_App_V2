import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import useBackToClose from '@/hooks/useBackToClose';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';

const UserMenu = () => {
  const { isAdmin, session, signOut } = useAuth();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();
  const [isOpen, setIsOpen] = useState(false);

  const username = session?.name ?? '';
  const close = () => setIsOpen(false);

  useBackToClose(isOpen, close);

  const handleLogout = async () => {
    close();
    showLoader();
    try {
      await request.get('/logout');
      await signOut();
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <Pressable
        accessibilityLabel={translator('my_account')}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ hovered }) => [styles.trigger, hovered && styles.triggerHovered]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{username.trim().charAt(0).toUpperCase() || 'A'}</Text>
        </View>
        <MaterialIcons color={colors.onPrimary} name="expand-more" size={20} />
      </Pressable>

      <Modal animationType="fade" onRequestClose={close} transparent visible={isOpen}>
        <Pressable onPress={close} style={styles.backdrop}>
          <View style={styles.menu}>
            <View style={styles.profile}>
              <ZAvatar name={username} shape="circle" size={44} />
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
            <Pressable
              onPress={handleLogout}
              style={({ hovered, pressed }) => [
                styles.menuItem,
                (hovered || pressed) && styles.menuItemHovered,
              ]}
            >
              <MaterialIcons color={colors.error} name="logout" size={20} />
              <Text style={styles.logoutText}>{translator('logout')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderRadius: radius.round,
    flexDirection: 'row',
    gap: 2,
    marginRight: spacing.md,
    padding: 3,
    paddingRight: spacing.xs,
  },
  triggerHovered: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.onPrimary,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: radius.round,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    ...shadows.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    minWidth: 240,
    overflow: 'hidden',
    position: 'absolute',
    right: spacing.md,
    top: 60,
  },
  profile: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  menuItemHovered: {
    backgroundColor: colors.errorSoft,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
  },
});

export default UserMenu;

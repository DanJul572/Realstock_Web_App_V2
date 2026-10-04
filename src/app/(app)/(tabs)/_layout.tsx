import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarButtonProps, Tabs } from 'expo-router/js-tabs';
import { ComponentProps } from 'react';
import { ColorValue, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, gradient, gradients, radius, scanTabButtonRise, shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/features/auth/UserMenu';
import translator from '@/lib/translator';

type IconNameType = ComponentProps<typeof MaterialIcons>['name'];

const tabIcon = (name: IconNameType) => {
  const TabIcon = ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <MaterialIcons color={color} name={name} size={22} />
    </View>
  );
  return TabIcon;
};

// The scan tab is a raised round button in the middle of the tab bar.
const ScanTabButton = ({ accessibilityState, onPress }: BottomTabBarButtonProps) => {
  const isFocused = Boolean(accessibilityState?.selected);
  return (
    <View style={styles.scanSlot}>
      <Pressable
        accessibilityLabel={translator('scan_code')}
        accessibilityRole="tab"
        accessibilityState={accessibilityState}
        onPress={onPress}
        style={({ hovered, pressed }) => [
          styles.scanButton,
          gradient(gradients.primary),
          (hovered || pressed) && styles.scanButtonPressed,
        ]}
      >
        <MaterialIcons color={colors.onPrimary} name="qr-code-scanner" size={30} />
      </Pressable>
      <Text style={[styles.scanLabel, isFocused && styles.scanLabelActive]}>
        {translator('scan_code')}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <UserMenu />,
        headerShadowVisible: false,
        headerStyle: styles.header,
        headerTintColor: colors.onPrimary,
        headerTitleStyle: styles.headerTitle,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: tabIcon('dashboard'),
          title: translator('dashboard'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          headerShown: false,
          tabBarButton: ScanTabButton,
          title: translator('scan_code'),
        }}
      />
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="transaction"
          options={{ tabBarIcon: tabIcon('point-of-sale'), title: translator('transaction') }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scene: {
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    boxShadow: '0 -4px 20px rgba(27, 21, 48, 0.06)',
    height: 68,
    overflow: 'visible',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconPill: {
    alignItems: 'center',
    borderRadius: radius.round,
    height: 30,
    justifyContent: 'center',
    width: 52,
  },
  iconPillActive: {
    backgroundColor: colors.primarySoft,
  },
  scanSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  scanButton: {
    ...shadows.lg,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderRadius: radius.round,
    borderWidth: 4,
    height: 66,
    justifyContent: 'center',
    marginTop: -scanTabButtonRise,
    width: 66,
  },
  scanButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  scanLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  scanLabelActive: {
    color: colors.primary,
  },
});

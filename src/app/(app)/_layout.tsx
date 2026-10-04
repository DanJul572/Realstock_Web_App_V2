import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import translator from '@/lib/translator';

export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontSize: 18, fontWeight: '700' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/index" options={{ title: translator('product') }} />
      <Stack.Screen name="product/[id]" options={{ title: translator('detail') }} />
      <Stack.Screen name="transaction/list" options={{ title: translator('transaction_list') }} />
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen
          name="transaction/form"
          options={{ title: translator('create_transaction') }}
        />
        <Stack.Screen name="product/form" />
        <Stack.Screen name="category/index" options={{ title: translator('category') }} />
        <Stack.Screen name="category/form" />
        <Stack.Screen name="user/index" options={{ title: translator('user') }} />
        <Stack.Screen name="user/form" />
      </Stack.Protected>
    </Stack>
  );
}

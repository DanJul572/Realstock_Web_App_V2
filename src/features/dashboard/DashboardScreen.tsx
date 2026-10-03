import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { ComponentProps, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors, gradient, gradients, radius, shadows, spacing, typography, withAlpha } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/features/auth/UserMenu';
import DashboardMenu from '@/features/dashboard/DashboardMenu';
import transactionColumns, { isOutgoing } from '@/features/transaction/transactionColumns';
import useDeleteRecord from '@/hooks/useDeleteRecord';
import usePaginatedList from '@/hooks/usePaginatedList';
import { formatNumber } from '@/lib/format';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { TransactionRowType } from '@/types';

type DashboardCountType = {
  productCount: number;
  userCount: number;
};

const appName = process.env.EXPO_PUBLIC_APP_NAME;

const DashboardScreen = () => {
  const router = useRouter();
  const { isAdmin, session } = useAuth();
  const { showAlert } = useAlert();
  const [dataCount, setDataCount] = useState<DashboardCountType>({
    productCount: 0,
    userCount: 0,
  });

  const transactions = usePaginatedList<TransactionRowType>({
    defaultSort: { field: 'transaction_created_at', order: 'desc' },
    endpoint: '/transactions',
  });
  const onDelete = useDeleteRecord('/transactions', transactions.reload);

  useFocusEffect(
    useCallback(() => {
      request
        .get<DashboardCountType>('/dashboard')
        .then(setDataCount)
        .catch((error) => showAlert('error', getErrorMessage(error)));
    }, [showAlert])
  );

  return (
    <ZListView
      columns={transactionColumns()}
      enableDeleteButton={isAdmin}
      getSubtitle={(item) => `${item.user_name} · ${item.transaction_created_at}`}
      getTitle={(item) => item.product_name}
      header={
        <View>
          <View style={[styles.hero, gradient(gradients.primary)]}>
            <View style={styles.heroCircle} />
            <View style={styles.heroTop}>
              <Text style={styles.appName}>{appName}</Text>
              <UserMenu />
            </View>
            <Text style={styles.greeting}>
              {translator('hello')}, {session?.name}
            </Text>
            <Text style={styles.welcome}>{translator('welcome_back')}</Text>
          </View>
          <View style={styles.stats}>
            <StatCard
              color={colors.primary}
              icon="inventory-2"
              onPress={() => router.push('/product')}
              title={translator('product')}
              value={dataCount.productCount}
            />
            <StatCard
              color={colors.info}
              icon="group"
              onPress={isAdmin ? () => router.push('/user') : undefined}
              title={translator('user')}
              value={dataCount.userCount}
            />
          </View>
          <DashboardMenu />
          <Text style={styles.sectionTitle}>{translator('transaction_list')}</Text>
        </View>
      }
      idField="transaction_id"
      list={transactions}
      onDelete={onDelete}
      renderLeading={(item) => {
        const isOut = isOutgoing(item);
        return (
          <ZAvatar
            color={isOut ? colors.error : colors.success}
            icon={isOut ? 'north-east' : 'south-west'}
            shape="circle"
          />
        );
      }}
      renderMeta={(item) => {
        const isOut = isOutgoing(item);
        const color = isOut ? colors.error : colors.success;
        return (
          <>
            <ZBadge color={color} label={`${isOut ? '−' : '+'}${formatNumber(item.transaction_count)}`} />
            <ZBadge color={color} label={item.transaction_type_name} />
            <ZBadge color={colors.textMuted} label={`${item.product_type} · ${item.product_size}`} />
          </>
        );
      }}
    />
  );
};

type StatCardPropsType = {
  color: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  onPress?: () => void;
  title: string;
  value: number;
};

const StatCard = ({ color, icon, onPress, title, value }: StatCardPropsType) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
      <MaterialIcons color={color} name={icon} size={24} />
    </View>
    <Text style={styles.statValue}>{formatNumber(value)}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {onPress && (
      <Pressable
        accessibilityLabel={`${translator('view_all')} ${title}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ hovered, pressed }) => [
          styles.statAction,
          { backgroundColor: withAlpha(color, hovered || pressed ? 0.16 : 0.08) },
        ]}
      >
        <Text style={[styles.statActionText, { color }]}>{translator('view_all')}</Text>
        <MaterialIcons color={color} name="arrow-forward" size={16} />
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    paddingBottom: 56,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  heroCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.round,
    height: 200,
    position: 'absolute',
    right: -50,
    top: -70,
    width: 200,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginRight: -spacing.md,
  },
  appName: {
    color: colors.onPrimaryMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  greeting: {
    ...typography.display,
    color: colors.onPrimary,
  },
  welcome: {
    color: colors.onPrimaryMuted,
    fontSize: 15,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: -36,
    paddingHorizontal: spacing.md,
  },
  statCard: {
    ...shadows.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xxs,
    padding: spacing.lg,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 44,
  },
  statValue: {
    ...typography.display,
    color: colors.text,
  },
  statTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  statAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  statActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xl,
  },
});

export default DashboardScreen;

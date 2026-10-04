import { useRouter } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import useDeleteRecord from '@/hooks/useDeleteRecord';
import usePaginatedList from '@/hooks/usePaginatedList';
import { formatCurrency, formatNumber } from '@/lib/format';
import translator from '@/lib/translator';
import { ColumnType, ProductRowType } from '@/types';

const lowStockLimit = 10;

const getColumns = (isAdmin: boolean): ColumnType<ProductRowType>[] => {
  const columns: ColumnType<ProductRowType>[] = [
    { field: 'product_name', label: translator('name') },
    { field: 'code', label: translator('code') },
    { field: 'size', label: translator('size') },
    { field: 'type', label: translator('type') },
    { field: 'stock', label: translator('stock') },
    { field: 'category_name', label: translator('category') },
  ];
  if (isAdmin) {
    columns.push(
      { field: 'price_1', format: formatCurrency, label: `${translator('price')} 1` },
      { field: 'price_2', format: formatCurrency, label: `${translator('price')} 2` }
    );
  }
  return columns;
};

const ProductListScreen = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const products = usePaginatedList<ProductRowType>({
    defaultParams: { isWithoutImage: false },
    defaultSort: { field: 'product_name', order: 'asc' },
    endpoint: '/products',
  });
  const onDelete = useDeleteRecord('/products', products.reload);

  return (
    <ZListView
      columns={getColumns(isAdmin)}
      enableAddButton={isAdmin}
      enableDeleteButton={isAdmin}
      enableDetailButton
      enableEditButton={isAdmin}
      getSubtitle={(item) => [item.category_name, item.size].filter(Boolean).join(' · ')}
      getTitle={(item) => `${item.product_name} - ${item.type}`}
      header={
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{translator('show_product_without_image')}</Text>
          <Switch
            onValueChange={(isWithoutImage) => products.setParams({ isWithoutImage })}
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            value={Boolean(products.params.isWithoutImage)}
          />
        </View>
      }
      idField="id"
      list={products}
      onAdd={() => router.push('/product/form')}
      onDelete={onDelete}
      onDetail={(id) => router.push({ pathname: '/product/[id]', params: { id } })}
      onEdit={(id) => router.push({ pathname: '/product/form', params: { id } })}
      renderLeading={(item) => <ZAvatar icon="inventory-2" imageUri={item.image} size={52} />}
      renderMeta={(item) => (
        <>
          <ZBadge
            color={item.stock < lowStockLimit ? colors.warning : colors.success}
            icon="layers"
            label={`${translator('stock')} ${formatNumber(item.stock)}`}
          />
          {isAdmin && (
            <ZBadge color={colors.primary} icon="sell" label={formatCurrency(item.price_1)} />
          )}
          {item.code ? (
            <ZBadge color={colors.textMuted} icon="qr-code-2" label={item.code} />
          ) : null}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  switchRow: {
    ...shadows.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  switchLabel: {
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
});

export default ProductListScreen;

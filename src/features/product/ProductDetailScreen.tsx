import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import ZBadge from '@/components/ZBadge';
import ZButton from '@/components/ZButton';
import ZIconButton from '@/components/ZIconButton';
import ZProductLabel from '@/components/ZProductLabel';
import {
  colors,
  contentMaxWidth,
  radius,
  shadows,
  spacing,
  typography,
  withAlpha,
} from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import useBottomInset from '@/hooks/useBottomInset';
import { formatCurrency, formatNumber } from '@/lib/format';
import getErrorMessage from '@/lib/getErrorMessage';
import { printLabels } from '@/lib/labels';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { ProductDetailType } from '@/types';

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const bottomInset = useBottomInset();
  const { hideLoader, showLoader } = useLoader();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [copies, setCopies] = useState(1);

  const getProduct = useCallback(() => {
    showLoader();
    request
      .get<ProductDetailType>(`/products/${id}`)
      .then(setProduct)
      .catch((error) => showAlert('error', getErrorMessage(error)))
      .finally(hideLoader);
  }, [hideLoader, id, showAlert, showLoader]);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  if (!product) {
    return null;
  }

  const label = product.code
    ? {
        code: product.code,
        subtitle: [product.type, product.size, product.category?.name].filter(Boolean).join(' · '),
        title: product.name,
      }
    : null;

  const onPrint = async () => {
    if (!label) {
      return;
    }
    try {
      await printLabels(label, copies);
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + bottomInset }]}
      style={styles.screen}
    >
      <View style={styles.imageCard}>
        {product.image ? (
          <Image contentFit="contain" source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <MaterialIcons color={colors.primaryTint} name="image-not-supported" size={56} />
            <Text style={styles.noImageText}>{translator('no_image')}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{product.name}</Text>
          <ZBadge label={product.type} />
        </View>
        {product.category?.name ? (
          <ZBadge color={colors.info} icon="category" label={product.category.name} />
        ) : null}

        <View style={styles.stockBox}>
          <Text style={styles.stockLabel}>{translator('stock')}</Text>
          <Text style={styles.stockValue}>{formatNumber(product.stock)}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoTile icon="straighten" label={translator('size')} value={product.size} />
          <InfoTile icon="texture" label={translator('surface')} value={product.surface} />
        </View>
        {isAdmin && (
          <View style={[styles.infoGrid, styles.priceGrid]}>
            <InfoTile
              color={colors.success}
              icon="sell"
              label={`${translator('price')} 1`}
              style={styles.priceTile}
              value={formatCurrency(product.price_1)}
            />
            <InfoTile
              color={colors.success}
              icon="sell"
              label={`${translator('price')} 2`}
              style={styles.priceTile}
              value={formatCurrency(product.price_2)}
            />
          </View>
        )}

        <View style={styles.actions}>
          <ZButton
            color={colors.textMuted}
            icon="arrow-back"
            onPress={() => router.back()}
            title={translator('back')}
            variant="outline"
          />
          <ZButton
            icon="refresh"
            onPress={getProduct}
            title={translator('refresh')}
            variant="soft"
          />
          {isAdmin && (
            <ZButton
              icon="edit"
              onPress={() => router.push({ pathname: '/product/form', params: { id } })}
              style={styles.editButton}
              title={translator('edit')}
            />
          )}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <MaterialIcons color={colors.primary} name="qr-code-2" size={20} />
          </View>
          <Text style={styles.sectionTitle}>{translator('code')}</Text>
        </View>
        {label ? (
          <>
            <ZProductLabel {...label} />
            <View style={styles.printRow}>
              <View style={styles.copies}>
                <ZIconButton
                  accessibilityLabel={translator('decrease')}
                  color={colors.primary}
                  name="remove"
                  onPress={() => setCopies((value) => Math.max(1, value - 1))}
                  variant="soft"
                />
                <View style={styles.copiesValue}>
                  <Text style={styles.copiesNumber}>{copies}</Text>
                  <Text style={styles.copiesLabel}>{translator('copies')}</Text>
                </View>
                <ZIconButton
                  accessibilityLabel={translator('increase')}
                  color={colors.primary}
                  name="add"
                  onPress={() => setCopies((value) => Math.min(100, value + 1))}
                  variant="soft"
                />
              </View>
              <ZButton
                icon="print"
                onPress={onPrint}
                style={styles.printButton}
                title={translator('print_label')}
              />
            </View>
          </>
        ) : (
          <View style={styles.noCode}>
            <Text style={styles.noCodeTitle}>{translator('no_code')}</Text>
            {isAdmin && <Text style={styles.noCodeHint}>{translator('no_code_hint')}</Text>}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

type InfoTilePropsType = {
  color?: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  style?: StyleProp<ViewStyle>;
  value: string;
};

// Values wrap instead of being cut off, so long prices stay fully visible.
const InfoTile = ({ color = colors.primary, icon, label, style, value }: InfoTilePropsType) => (
  <View style={[styles.tile, style]}>
    <View style={[styles.tileIcon, { backgroundColor: withAlpha(color, 0.1) }]}>
      <MaterialIcons color={color} name={icon} size={18} />
    </View>
    <View style={styles.tileText}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value || '-'}</Text>
    </View>
  </View>
);

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
  imageCard: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    height: 280,
    width: '100%',
  },
  noImage: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 1.5,
  },
  noImageText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.xl,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  stockBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    marginVertical: spacing.xs,
    padding: spacing.lg,
  },
  stockLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  stockValue: {
    color: colors.primaryDark,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  // Prices sit side by side on wide screens and stack full width on phones.
  priceGrid: {
    flexWrap: 'wrap',
  },
  priceTile: {
    flexBasis: 220,
  },
  tile: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  tileText: {
    flex: 1,
    minWidth: 0,
  },
  tileLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tileValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editButton: {
    flexGrow: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  printRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  copies: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  copiesValue: {
    alignItems: 'center',
    minWidth: 56,
  },
  copiesNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  copiesLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  printButton: {
    flexGrow: 1,
  },
  noCode: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  noCodeTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  noCodeHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default ProductDetailScreen;

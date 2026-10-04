import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isAxiosError } from 'axios';
import { useIsFocused, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import ZCodeScanner from '@/components/ZCodeScanner';
import ZManualCodeInput from '@/components/ZManualCodeInput';
import { colors, contentMaxWidth, radius, shadows, spacing, typography } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import useTabBarOverlap from '@/hooks/useTabBarOverlap';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { ProductDetailType } from '@/types';

const ScanScreen = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();
  const [isBusy, setIsBusy] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const tabBarOverlap = useTabBarOverlap();

  const findProduct = async (code: string) => {
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    showLoader();
    try {
      const product = await request.get<ProductDetailType>('/products/by-code', { code });
      router.push({ pathname: '/product/[id]', params: { id: product.id } });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        setNotFoundCode(code);
      } else {
        showAlert('error', getErrorMessage(error));
      }
    } finally {
      hideLoader();
      setIsBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.camera}>
        <ZCodeScanner
          active={isFocused}
          onScanned={findProduct}
          paused={isBusy || notFoundCode !== null}
        />
        <View pointerEvents="none" style={styles.titleBar}>
          <Text style={styles.title}>{translator('scan_code')}</Text>
        </View>
      </View>

      <View style={[styles.panel, { paddingBottom: spacing.lg + tabBarOverlap }]}>
        {notFoundCode ? (
          <View accessibilityRole="alert" style={styles.notFound}>
            <View style={styles.notFoundIcon}>
              <MaterialIcons color={colors.warning} name="search-off" size={28} />
            </View>
            <Text style={styles.notFoundTitle}>{translator('code_not_found_title')}</Text>
            <Text style={styles.notFoundCode}>{notFoundCode}</Text>
            <Text style={styles.notFoundHint}>{translator('code_not_found_hint')}</Text>
            <View style={styles.notFoundActions}>
              <ZButton
                icon="qr-code-scanner"
                onPress={() => setNotFoundCode(null)}
                style={styles.action}
                title={translator('scan_again')}
                variant={isAdmin ? 'outline' : 'contained'}
              />
              {isAdmin && (
                <ZButton
                  icon="add"
                  onPress={() => {
                    const code = notFoundCode;
                    setNotFoundCode(null);
                    router.push({ pathname: '/product/form', params: { code } });
                  }}
                  style={styles.action}
                  title={translator('register_product')}
                />
              )}
            </View>
          </View>
        ) : (
          <ZManualCodeInput onSubmit={findProduct} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  titleBar: {
    left: spacing.lg,
    position: 'absolute',
    top: spacing.lg + 4,
  },
  title: {
    ...typography.subtitle,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: radius.round,
    color: colors.onPrimary,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  panel: {
    ...shadows.lg,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  notFound: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    maxWidth: contentMaxWidth,
    width: '100%',
  },
  notFoundIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.round,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 56,
  },
  notFoundTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  notFoundCode: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    color: colors.primary,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  notFoundHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  notFoundActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
});

export default ScanScreen;

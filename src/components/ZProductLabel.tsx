import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { code128Svg, LabelType, qrCodeSvg, svgDataUri } from '@/lib/labels';

// On-screen preview of the printed sticker (same content as the print HTML).
const ZProductLabel = ({ code, subtitle, title }: LabelType) => {
  const barcode = code128Svg(code);

  return (
    <View style={styles.label}>
      <Image
        accessibilityLabel={`QR ${code}`}
        contentFit="contain"
        source={{ uri: svgDataUri(qrCodeSvg(code)) }}
        style={styles.qr}
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
        {barcode && (
          <Image
            accessibilityLabel={`Barcode ${code}`}
            contentFit="fill"
            source={{ uri: svgDataUri(barcode) }}
            style={styles.barcode}
          />
        )}
        <Text style={styles.code}>{code}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    aspectRatio: 3 / 2,
    backgroundColor: '#fff',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    maxWidth: 360,
    padding: spacing.md,
    width: '100%',
  },
  qr: {
    aspectRatio: 1,
    width: '40%',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    color: '#444',
    fontSize: 11,
  },
  barcode: {
    height: 36,
    width: '100%',
  },
  code: {
    color: '#000',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ZProductLabel;

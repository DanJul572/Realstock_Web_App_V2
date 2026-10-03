import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BarcodeScanningResult, BarcodeType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import { colors, radius, spacing, typography } from '@/constants/theme';
import getErrorMessage from '@/lib/getErrorMessage';
import prepareScanner from '@/lib/prepareScanner';
import translator from '@/lib/translator';

// QR for generated labels, EAN-13 for manufacturer barcodes, Code 128 for the
// barcode printed under our own labels.
const barcodeTypes: BarcodeType[] = ['qr', 'ean13', 'code128'];

type PropsType = {
  // Turns the camera off (e.g. when the screen is not focused).
  active: boolean;
  onScanned: (code: string) => void;
  // Stops reporting codes while the parent handles the previous one.
  paused?: boolean;
};

const ZCodeScanner = ({ active, onScanned, paused }: PropsType) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  // Several frames can report the same code before `paused` propagates.
  const lastReported = useRef<{ code: string; time: number } | null>(null);

  useEffect(() => {
    prepareScanner()
      .then(() => setIsScannerReady(true))
      .catch((error) => setMountError(getErrorMessage(error)));
  }, []);

  const handleScanned = (result: BarcodeScanningResult) => {
    const code = result.data?.trim();
    if (!code) {
      return;
    }
    const now = Date.now();
    const last = lastReported.current;
    if (last && last.code === code && now - last.time < 2000) {
      return;
    }
    lastReported.current = { code, time: now };
    onScanned(code);
  };

  if (!permission || !isScannerReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.onPrimary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionIcon}>
          <MaterialIcons color={colors.onPrimary} name="no-photography" size={36} />
        </View>
        <Text style={styles.permissionTitle}>{translator('camera_permission_title')}</Text>
        <Text style={styles.permissionHint}>
          {translator(permission.canAskAgain ? 'camera_permission_hint' : 'camera_denied_hint')}
        </Text>
        {permission.canAskAgain && (
          <ZButton
            icon="photo-camera"
            onPress={requestPermission}
            style={styles.permissionButton}
            title={translator('allow_camera')}
          />
        )}
      </View>
    );
  }

  if (mountError) {
    return (
      <View style={styles.center}>
        <MaterialIcons color={colors.onPrimary} name="videocam-off" size={40} />
        <Text style={styles.permissionTitle}>{translator('camera_error')}</Text>
        <Text style={styles.permissionHint}>{mountError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {active && (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes }}
          enableTorch={isTorchOn}
          facing={facing}
          onBarcodeScanned={paused ? undefined : handleScanned}
          onMountError={(event) => setMountError(event.message)}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>
        <Text style={styles.hint}>{translator('scan_hint')}</Text>
      </View>
      <View style={styles.controls}>
        {Platform.OS !== 'web' && (
          <ControlButton
            icon={isTorchOn ? 'flash-on' : 'flash-off'}
            label={translator('torch')}
            onPress={() => setIsTorchOn((value) => !value)}
          />
        )}
        <ControlButton
          icon="flip-camera-android"
          label={translator('flip_camera')}
          onPress={() => setFacing((value) => (value === 'back' ? 'front' : 'back'))}
        />
      </View>
    </View>
  );
};

type ControlButtonPropsType = {
  icon: 'flash-on' | 'flash-off' | 'flip-camera-android';
  label: string;
  onPress: () => void;
};

const ControlButton = ({ icon, label, onPress }: ControlButtonPropsType) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
  >
    <MaterialIcons color={colors.onPrimary} name={icon} size={22} />
  </Pressable>
);

const frameSize = 240;
const cornerSize = 34;
const cornerWidth = 4;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    backgroundColor: '#0f0a1a',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.round,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  permissionTitle: {
    ...typography.subtitle,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  permissionHint: {
    color: 'rgba(255, 255, 255, 0.72)',
    maxWidth: 320,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    gap: spacing.xl,
    justifyContent: 'center',
  },
  frame: {
    borderRadius: radius.xl,
    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.45)',
    height: frameSize,
    width: frameSize,
  },
  corner: {
    borderColor: colors.onPrimary,
    height: cornerSize,
    position: 'absolute',
    width: cornerSize,
  },
  cornerTopLeft: {
    borderLeftWidth: cornerWidth,
    borderTopLeftRadius: radius.xl,
    borderTopWidth: cornerWidth,
    left: 0,
    top: 0,
  },
  cornerTopRight: {
    borderRightWidth: cornerWidth,
    borderTopRightRadius: radius.xl,
    borderTopWidth: cornerWidth,
    right: 0,
    top: 0,
  },
  cornerBottomLeft: {
    borderBottomLeftRadius: radius.xl,
    borderBottomWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    borderBottomRightRadius: radius.xl,
    borderBottomWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    bottom: 0,
    right: 0,
  },
  hint: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: radius.round,
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: radius.round,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default ZCodeScanner;

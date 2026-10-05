import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ZCodeScanner from '@/components/ZCodeScanner';
import ZIconButton from '@/components/ZIconButton';
import ZManualCodeInput from '@/components/ZManualCodeInput';
import { colors, radius, spacing, typography } from '@/constants/theme';
import useBackToClose from '@/hooks/useBackToClose';
import translator from '@/lib/translator';

type PropsType = {
  onClose: () => void;
  onScanned: (code: string) => void;
  visible: boolean;
};

// Full-screen scanner used to fill a code field (e.g. the product form).
const ZScannerModal = ({ onClose, onScanned, visible }: PropsType) => {
  const insets = useSafeAreaInsets();
  useBackToClose(visible, onClose);

  const handleCode = (code: string) => {
    onScanned(code);
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: spacing.sm + insets.top }]}>
          <Text style={styles.title}>{translator('scan_code')}</Text>
          <ZIconButton
            accessibilityLabel={translator('cancel')}
            color={colors.onPrimary}
            name="close"
            onPress={onClose}
          />
        </View>
        <View style={styles.camera}>
          {visible && <ZCodeScanner active={visible} onScanned={handleCode} />}
        </View>
        <View style={[styles.manual, { paddingBottom: spacing.lg + insets.bottom }]}>
          <ZManualCodeInput onSubmit={handleCode} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.onPrimary,
  },
  camera: {
    flex: 1,
  },
  manual: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
});

export default ZScannerModal;

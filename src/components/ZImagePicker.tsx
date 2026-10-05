import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import ZIconButton from '@/components/ZIconButton';
import { fieldStyles } from '@/components/ZTextField';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import translator from '@/lib/translator';

type PropsType = {
  fileName: string | null;
  label: string;
  onClear: () => void;
  onPick: () => void;
  onTakePhoto: () => void;
  previewUri: string | null;
};

const ZImagePicker = ({ fileName, label, onClear, onPick, onTakePhoto, previewUri }: PropsType) => {
  const sourceButtons = (
    <View style={styles.sourceActions}>
      <ZButton
        accessibilityLabel={`${translator('pick_image')} ${label}`}
        icon="photo-library"
        onPress={onPick}
        style={styles.sourceButton}
        title={translator('pick_image')}
        variant="soft"
      />
      <ZButton
        accessibilityLabel={`${translator('take_photo')} ${label}`}
        icon="photo-camera"
        onPress={onTakePhoto}
        style={styles.sourceButton}
        title={translator('take_photo')}
        variant="soft"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {previewUri ? (
        <View style={styles.previewCard}>
          <View>
            <Image contentFit="contain" source={{ uri: previewUri }} style={styles.preview} />
            <View style={styles.clearButton}>
              <ZIconButton
                accessibilityLabel={translator('remove_image')}
                color={colors.error}
                name="delete-outline"
                onPress={onClear}
              />
            </View>
          </View>
          <View style={styles.previewFooter}>
            <MaterialIcons color={colors.primary} name="image" size={20} />
            <Text numberOfLines={1} style={styles.fileName}>
              {fileName ?? translator('current_image')}
            </Text>
          </View>
          {sourceButtons}
        </View>
      ) : (
        <View style={styles.dropzone}>
          <View style={styles.dropzoneIcon}>
            <MaterialIcons color={colors.primary} name="add-photo-alternate" size={28} />
          </View>
          <Text style={styles.dropzoneHint}>PNG, JPG, WEBP</Text>
          {sourceButtons}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  dropzone: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primaryTint,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  dropzoneIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.round,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  dropzoneHint: {
    color: colors.textSubtle,
    fontSize: 12,
  },
  previewCard: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
    paddingBottom: spacing.md,
  },
  preview: {
    backgroundColor: colors.surfaceMuted,
    height: 220,
    width: '100%',
  },
  previewFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  fileName: {
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  clearButton: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  sourceActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sourceButton: {
    flexGrow: 1,
  },
});

export default ZImagePicker;

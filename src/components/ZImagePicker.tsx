import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import { fieldStyles } from '@/components/ZTextField';
import { colors, radius, spacing } from '@/constants/theme';
import translator from '@/lib/translator';

type PropsType = {
  fileName: string | null;
  label: string;
  onClear: () => void;
  onPick: () => void;
  previewUri: string | null;
};

const ZImagePicker = ({ fileName, label, onClear, onPick, previewUri }: PropsType) => {
  return (
    <View style={styles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {previewUri ? (
        <View style={styles.previewCard}>
          <Image contentFit="contain" source={{ uri: previewUri }} style={styles.preview} />
          <View style={styles.previewFooter}>
            <MaterialIcons color={colors.primary} name="image" size={20} />
            <Text numberOfLines={1} style={styles.fileName}>
              {fileName}
            </Text>
          </View>
          <View style={styles.previewActions}>
            <ZButton
              accessibilityLabel={label}
              icon="swap-horiz"
              onPress={onPick}
              style={styles.previewButton}
              title={translator('change_image')}
              variant="soft"
            />
            <ZButton
              color={colors.error}
              icon="delete-outline"
              onPress={onClear}
              style={styles.previewButton}
              title={translator('clear')}
              variant="soft"
            />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          onPress={onPick}
          style={({ hovered }) => [styles.dropzone, hovered && styles.dropzoneHovered]}
        >
          <View style={styles.dropzoneIcon}>
            <MaterialIcons color={colors.primary} name="add-photo-alternate" size={28} />
          </View>
          <Text style={styles.dropzoneTitle}>{translator('pick_image')}</Text>
          <Text style={styles.dropzoneHint}>PNG, JPG, WEBP</Text>
        </Pressable>
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
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  dropzoneHovered: {
    backgroundColor: colors.primarySoft,
  },
  dropzoneIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.round,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 56,
  },
  dropzoneTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
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
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  previewButton: {
    flex: 1,
  },
});

export default ZImagePicker;

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Children, ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import { colors, contentMaxWidth, radius, shadows, spacing, typography } from '@/constants/theme';
import translator from '@/lib/translator';

type PropsType = {
  children: ReactNode;
  onBack?: () => void;
  onClear: () => void;
  onSubmit: () => void;
};

// Scrollable form with the actions pinned to the bottom of the screen.
const ZFormScreen = ({ children, onBack, onClear, onSubmit }: PropsType) => {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.actions}>
          {onBack && (
            <ZButton
              color={colors.textMuted}
              icon="arrow-back"
              onPress={onBack}
              title={translator('back')}
              variant="ghost"
            />
          )}
          <ZButton
            color={colors.textMuted}
            icon="refresh"
            onPress={onClear}
            title={translator('clear')}
            variant="outline"
          />
          <ZButton icon="check" onPress={onSubmit} style={styles.submit} title={translator('submit')} />
        </View>
      </View>
    </View>
  );
};

type SectionPropsType = {
  children: ReactNode;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
};

export const ZFormSection = ({ children, icon, title }: SectionPropsType) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <MaterialIcons color={colors.primary} name={icon} size={18} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export const ZFormRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.row}>
    {Children.map(children, (child) => (
      <View style={styles.rowItem}>{child}</View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: contentMaxWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    boxShadow: '0 -4px 16px rgba(27, 21, 48, 0.06)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actions: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    maxWidth: contentMaxWidth,
    width: '100%',
  },
  submit: {
    flex: 1,
  },
  section: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.lg,
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
  sectionBody: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});

export default ZFormScreen;

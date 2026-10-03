import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import useBackToClose from '@/hooks/useBackToClose';

type ConfirmOptionsType = {
  cancelButton: string;
  confirmButton: string;
  content: string;
  title: string;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptionsType) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

// Alert.alert is a no-op on web, so the confirmation dialog is rendered here.
export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptionsType | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (newOptions: ConfirmOptionsType) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(newOptions);
      }),
    []
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  const close = (isConfirmed: boolean) => {
    resolver.current?.(isConfirmed);
    resolver.current = null;
    setOptions(null);
  };

  // Back on a phone cancels the dialog instead of leaving the page under it.
  useBackToClose(Boolean(options), () => close(false));

  return (
    <ConfirmContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {options && (
          <View style={styles.backdrop}>
            <View accessibilityRole="alert" style={styles.dialog}>
              <View style={styles.iconCircle}>
                <MaterialIcons color={colors.error} name="delete-outline" size={30} />
              </View>
              <Text style={styles.title}>{options.title}</Text>
              <Text style={styles.content}>{options.content}</Text>
              <View style={styles.actions}>
                <ZButton
                  color={colors.textMuted}
                  onPress={() => close(false)}
                  style={styles.action}
                  title={options.cancelButton}
                  variant="outline"
                />
                <ZButton
                  color={colors.error}
                  onPress={() => close(true)}
                  style={styles.action}
                  title={options.confirmButton}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return context.confirm;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 80,
  },
  dialog: {
    ...shadows.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    gap: spacing.sm,
    maxWidth: 400,
    padding: spacing.xl,
    width: '100%',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.errorSoft,
    borderRadius: radius.round,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 64,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  content: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
});

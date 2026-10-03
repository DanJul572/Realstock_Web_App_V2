import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/constants/theme';
import translator from '@/lib/translator';

type LoaderContextType = {
  hideLoader: () => void;
  showLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  // A counter so overlapping requests keep the loader open until all finish.
  const [pending, setPending] = useState(0);

  const showLoader = useCallback(() => setPending((count) => count + 1), []);
  const hideLoader = useCallback(() => setPending((count) => Math.max(0, count - 1)), []);

  const value = useMemo(() => ({ hideLoader, showLoader }), [hideLoader, showLoader]);

  return (
    <LoaderContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {pending > 0 && (
          <View style={styles.backdrop}>
            <View style={styles.box}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.text}>{translator('loading')}...</Text>
            </View>
          </View>
        )}
      </View>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used inside LoaderProvider');
  }
  return context;
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
    zIndex: 100,
  },
  box: {
    ...shadows.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
    minWidth: 140,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  text: {
    color: colors.textMuted,
    fontWeight: '500',
  },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, withAlpha } from '@/constants/theme';
import { AlertType } from '@/types';

type AlertStateType = {
  id: number;
  message: string;
  type: AlertType;
};

type AlertContextType = {
  hideAlert: () => void;
  showAlert: (type: AlertType, message: string) => void;
};

const autoHideMs = 5000;

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertStateType | null>(null);

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ id: Date.now(), message, type });
  }, []);

  const hideAlert = useCallback(() => setAlert(null), []);

  const value = useMemo(() => ({ hideAlert, showAlert }), [hideAlert, showAlert]);

  useEffect(() => {
    if (!alert) {
      return;
    }
    const timerId = setTimeout(() => setAlert(null), autoHideMs);
    return () => clearTimeout(timerId);
  }, [alert]);

  const color = alert?.type === 'success' ? colors.success : colors.error;

  return (
    <AlertContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {alert && (
          <View style={styles.container} pointerEvents="box-none">
            <View accessibilityRole="alert" style={styles.toast}>
              <View style={[styles.accent, { backgroundColor: color }]} />
              <View style={[styles.iconCircle, { backgroundColor: withAlpha(color, 0.12) }]}>
                <MaterialIcons
                  color={color}
                  name={alert.type === 'success' ? 'check-circle' : 'error'}
                  size={20}
                />
              </View>
              <Text style={styles.message}>{alert.message}</Text>
              <Pressable hitSlop={8} onPress={hideAlert} style={styles.close}>
                <MaterialIcons color={colors.textSubtle} name="close" size={18} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used inside AlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    left: 0,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: 0,
    top: spacing.md,
    zIndex: 90,
  },
  toast: {
    ...shadows.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    maxWidth: 480,
    overflow: 'hidden',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.md,
    width: '100%',
  },
  accent: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.round,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  message: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  close: {
    padding: spacing.xs,
  },
});

import { Image } from 'expo-image';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ZButton from '@/components/ZButton';
import ZTextField from '@/components/ZTextField';
import {
  colors,
  gradient,
  gradients,
  radius,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { LoginResponseType } from '@/types';

type LoginFormType = {
  email: string;
  password: string;
};

const appName = process.env.EXPO_PUBLIC_APP_NAME;

const LoginScreen = () => {
  const { signIn } = useAuth();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();

  const { control, handleSubmit } = useForm<LoginFormType>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    showLoader();
    try {
      const response = await request.post<LoginResponseType>('/login', data);
      await signIn(response);
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={[styles.hero, gradient(gradients.primary)]}>
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleBottom]} />
        <View style={styles.logoBox}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        </View>
        <Text style={styles.appName}>{appName}</Text>
        <Text style={styles.tagline}>{translator('login_tagline')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{translator('login_title')}</Text>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <ZTextField
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
              inputMode="email"
              label="Email"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="nama@email.com"
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <ZTextField
              autoComplete="current-password"
              icon="lock-outline"
              label="Password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={onSubmit}
              placeholder="••••••••"
              secureTextEntry
              value={field.value}
            />
          )}
        />
        <ZButton
          icon="login"
          onPress={onSubmit}
          size="lg"
          style={styles.button}
          title={translator('login')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl * 1.5,
    borderBottomRightRadius: radius.xl * 1.5,
    gap: spacing.sm,
    overflow: 'hidden',
    paddingBottom: 96,
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
  },
  circle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.round,
    position: 'absolute',
  },
  circleTop: {
    height: 220,
    right: -60,
    top: -80,
    width: 220,
  },
  circleBottom: {
    bottom: -90,
    height: 180,
    left: -50,
    width: 180,
  },
  logoBox: {
    ...shadows.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  logo: {
    borderRadius: radius.md,
    height: 48,
    width: 48,
  },
  appName: {
    ...typography.display,
    color: colors.onPrimary,
  },
  tagline: {
    color: colors.onPrimaryMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    ...shadows.md,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    gap: spacing.lg,
    marginBottom: spacing.xl,
    marginTop: -64,
    maxWidth: 440,
    padding: spacing.xl,
    width: '90%',
  },
  cardTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
  },
});

export default LoginScreen;

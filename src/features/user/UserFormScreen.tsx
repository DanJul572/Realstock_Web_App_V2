import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';

import ZFormScreen, { ZFormSection } from '@/components/ZFormScreen';
import ZSelect from '@/components/ZSelect';
import ZTextField from '@/components/ZTextField';
import useRecordForm from '@/hooks/useRecordForm';
import translator from '@/lib/translator';
import { OptionType, UserType } from '@/types';

type UserFormType = {
  email: string;
  name: string;
  password: string;
  role_id: string;
};

const roleOptions: OptionType[] = [
  { label: 'Admin', value: '1' },
  { label: 'User', value: '2' },
];

const toForm = (user: UserType): UserFormType => ({
  email: user.email ?? '',
  name: user.name ?? '',
  password: '',
  role_id: user.role_id?.toString() ?? '',
});

// When editing, an empty password means "keep the current password".
const toPayload = ({ password, ...form }: UserFormType, isEdit: boolean) =>
  isEdit && !password ? form : { ...form, password };

const UserFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const { control, isEdit, onClear, onSubmit } = useRecordForm<UserFormType, UserType>({
    defaultValues: { email: '', name: '', password: '', role_id: '' },
    endpoint: '/users',
    id,
    toForm,
    toPayload,
  });

  const title = `${translator(isEdit ? 'edit' : 'create')} ${translator('user')}`;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ZFormScreen onBack={() => router.back()} onClear={onClear} onSubmit={onSubmit}>
        <ZFormSection icon="person" title={translator('user')}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <ZTextField
                icon="badge"
                label={translator('name')}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <ZTextField
                autoCapitalize="none"
                icon="mail-outline"
                inputMode="email"
                label={translator('email')}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <ZTextField
                autoComplete="new-password"
                icon="lock-outline"
                label={translator('password')}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                secureTextEntry
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="role_id"
            render={({ field }) => (
              <ZSelect
                icon="admin-panel-settings"
                label={translator('role_id')}
                onChange={(value) => field.onChange(value ?? '')}
                options={roleOptions}
                value={field.value}
              />
            )}
          />
        </ZFormSection>
      </ZFormScreen>
    </>
  );
};

export default UserFormScreen;

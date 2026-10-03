import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';

import ZFormScreen, { ZFormSection } from '@/components/ZFormScreen';
import ZTextField from '@/components/ZTextField';
import useRecordForm from '@/hooks/useRecordForm';
import translator from '@/lib/translator';
import { CategoryType } from '@/types';

type CategoryFormType = {
  name: string;
};

const CategoryFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const { control, isEdit, onClear, onSubmit } = useRecordForm<CategoryFormType, CategoryType>({
    defaultValues: { name: '' },
    endpoint: '/categories',
    id,
    toForm: (category) => ({ name: category.name ?? '' }),
    toPayload: (form) => form,
  });

  const title = `${translator(isEdit ? 'edit' : 'create')} ${translator('category')}`;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ZFormScreen onBack={() => router.back()} onClear={onClear} onSubmit={onSubmit}>
        <ZFormSection icon="category" title={translator('category')}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <ZTextField
                icon="label-outline"
                label={translator('name')}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                onSubmitEditing={onSubmit}
                value={field.value}
              />
            )}
          />
        </ZFormSection>
      </ZFormScreen>
    </>
  );
};

export default CategoryFormScreen;

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ComponentProps, useState } from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { StyleSheet, TextInputProps } from 'react-native';

import ZFormScreen, { ZFormRow, ZFormSection } from '@/components/ZFormScreen';
import ZIconButton from '@/components/ZIconButton';
import ZImagePicker from '@/components/ZImagePicker';
import ZScannerModal from '@/components/ZScannerModal';
import ZSelect from '@/components/ZSelect';
import ZTextField from '@/components/ZTextField';
import { colors } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useLoader } from '@/context/LoaderContext';
import useCategoryOptions from '@/features/category/useCategoryOptions';
import useRecordForm from '@/hooks/useRecordForm';
import getErrorMessage from '@/lib/getErrorMessage';
import pickResizedImage from '@/lib/pickResizedImage';
import { generateUniqueCode, maxCodeLength } from '@/lib/productCode';
import translator from '@/lib/translator';
import { ProductType } from '@/types';

type ProductFormType = {
  category_id: string | null;
  code: string;
  image: string | null;
  imageName: string | null;
  name: string;
  price_1: string;
  price_2: string;
  size: string;
  stock: string;
  surface: string;
  type: string;
};

const defaultValues: ProductFormType = {
  category_id: null,
  code: '',
  image: null,
  imageName: null,
  name: '',
  price_1: '0',
  price_2: '0',
  size: '',
  stock: '0',
  surface: '',
  type: '',
};

const toForm = (product: ProductType): ProductFormType => ({
  category_id: product.category_id?.toString() ?? null,
  code: product.code ?? '',
  image: null,
  imageName: null,
  name: product.name ?? '',
  price_1: String(product.price_1 ?? 0),
  price_2: String(product.price_2 ?? 0),
  size: product.size ?? '',
  stock: String(product.stock ?? 0),
  surface: product.surface ?? '',
  type: product.type ?? '',
});

// Only send `image` when a new one was picked, so editing keeps the old image.
const toPayload = (form: ProductFormType) => ({
  category_id: form.category_id,
  code: form.code.trim() || null,
  name: form.name,
  price_1: Number(form.price_1),
  price_2: Number(form.price_2),
  size: form.size,
  stock: Number(form.stock),
  surface: form.surface,
  type: form.type,
  ...(form.image ? { image: form.image } : {}),
});

const ProductFormScreen = () => {
  // `code` is passed when registering a product from an unknown scanned code.
  const { code: scannedCode, id } = useLocalSearchParams<{ code?: string; id?: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();
  const categoryOptions = useCategoryOptions();
  const [isPicking, setIsPicking] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { control, isEdit, onClear, onSubmit, setValue, watch } = useRecordForm<
    ProductFormType,
    ProductType
  >({
    defaultValues: { ...defaultValues, code: scannedCode ?? '' },
    endpoint: '/products',
    id,
    toForm,
    toPayload,
  });

  const onGenerateCode = async () => {
    showLoader();
    try {
      const code = await generateUniqueCode(id);
      setValue('code', code, { shouldDirty: true });
      showAlert('success', translator('code_generated'));
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  };

  const image = watch('image');
  const imageName = watch('imageName');

  const onPickImage = async () => {
    if (isPicking) {
      return;
    }
    setIsPicking(true);
    try {
      const picked = await pickResizedImage();
      if (picked) {
        setValue('image', picked.dataUrl);
        setValue('imageName', picked.name);
      }
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      setIsPicking(false);
    }
  };

  const onClearImage = () => {
    setValue('image', null);
    setValue('imageName', null);
  };

  const title = `${translator(isEdit ? 'edit' : 'create')} ${translator('product')}`;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ZFormScreen onBack={() => router.back()} onClear={onClear} onSubmit={onSubmit}>
        <ZFormSection icon="qr-code-2" title={translator('product_code')}>
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <ZTextField
                autoCapitalize="characters"
                icon="qr-code"
                maxLength={maxCodeLength}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="RS-XXXXXXXX"
                right={
                  <>
                    <ZIconButton
                      accessibilityLabel={translator('scan_code')}
                      color={colors.primary}
                      name="qr-code-scanner"
                      onPress={() => setIsScannerOpen(true)}
                      variant="soft"
                    />
                    <ZIconButton
                      accessibilityLabel={translator('generate_code')}
                      color={colors.warning}
                      name="auto-awesome"
                      onPress={onGenerateCode}
                      variant="soft"
                    />
                  </>
                }
                style={styles.codeInput}
                value={field.value}
              />
            )}
          />
        </ZFormSection>

        <ZFormSection icon="inventory-2" title={translator('product_info')}>
          <TextField control={control} icon="label-outline" label={translator('name')} name="name" />
          <ZFormRow>
            <TextField control={control} icon="style" label={translator('type')} name="type" />
            <TextField control={control} icon="straighten" label={translator('size')} name="size" />
          </ZFormRow>
          <TextField control={control} icon="texture" label={translator('surface')} name="surface" />
        </ZFormSection>

        <ZFormSection icon="payments" title={translator('stock_and_price')}>
          <TextField
            control={control}
            icon="layers"
            inputMode="numeric"
            label={translator('stock')}
            name="stock"
          />
          <ZFormRow>
            <TextField
              control={control}
              icon="sell"
              inputMode="decimal"
              label={`${translator('price')} 1`}
              name="price_1"
            />
            <TextField
              control={control}
              icon="sell"
              inputMode="decimal"
              label={`${translator('price')} 2`}
              name="price_2"
            />
          </ZFormRow>
        </ZFormSection>

        <ZFormSection icon="category" title={translator('category_and_image')}>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <ZSelect
                clearable
                icon="category"
                label={translator('category')}
                onChange={field.onChange}
                options={categoryOptions}
                searchable
                value={field.value}
              />
            )}
          />
          <ZImagePicker
            fileName={imageName}
            label={translator('image')}
            onClear={onClearImage}
            onPick={onPickImage}
            previewUri={image}
          />
        </ZFormSection>
      </ZFormScreen>
      <ZScannerModal
        onClose={() => setIsScannerOpen(false)}
        onScanned={(code) => setValue('code', code, { shouldDirty: true })}
        visible={isScannerOpen}
      />
    </>
  );
};

type TextFieldPropsType = {
  control: Control<ProductFormType>;
  icon: ComponentProps<typeof ZTextField>['icon'];
  inputMode?: TextInputProps['inputMode'];
  label: string;
  name: FieldPath<ProductFormType>;
};

const TextField = ({ control, icon, inputMode, label, name }: TextFieldPropsType) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <ZTextField
        icon={icon}
        inputMode={inputMode}
        label={label}
        onBlur={field.onBlur}
        onChangeText={field.onChange}
        value={field.value ?? ''}
      />
    )}
  />
);

const styles = StyleSheet.create({
  codeInput: {
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ProductFormScreen;

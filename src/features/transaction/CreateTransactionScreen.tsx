import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ZFormScreen, { ZFormSection } from '@/components/ZFormScreen';
import ZIconButton from '@/components/ZIconButton';
import ZSelect from '@/components/ZSelect';
import ZTextField, { fieldStyles } from '@/components/ZTextField';
import { colors, radius, spacing, withAlpha } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useLoader } from '@/context/LoaderContext';
import useCategoryOptions, { toOptions } from '@/features/category/useCategoryOptions';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { OptionType } from '@/types';

type TransactionFormType = {
  count: string;
  product_id: string | null;
  transaction_type_id: string;
};

type TransactionTypeOptionType = {
  color: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
};

const defaultValues: TransactionFormType = {
  count: '0',
  product_id: null,
  transaction_type_id: '1',
};

const CreateTransactionScreen = () => {
  const { hideAlert, showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();
  const categoryOptions = useCategoryOptions();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<OptionType[]>([]);

  const transactionTypeOptions: TransactionTypeOptionType[] = [
    { color: colors.success, icon: 'south-west', label: translator('in'), value: '1' },
    { color: colors.error, icon: 'north-east', label: translator('out'), value: '2' },
  ];

  const { control, handleSubmit, reset, setValue } = useForm<TransactionFormType>({
    defaultValues,
  });

  // Products are filtered by the selected category.
  const onCategoryChange = (value: string | null) => {
    setCategoryFilter(value);
    setProductOptions([]);
    setValue('product_id', null);
  };

  useEffect(() => {
    if (!categoryFilter) {
      return;
    }
    showLoader();
    request
      .get<OptionType[]>('/products/options', { categoryFilter })
      .then((response) => setProductOptions(toOptions(response)))
      .catch((error) => showAlert('error', getErrorMessage(error)))
      .finally(hideLoader);
  }, [categoryFilter, hideLoader, showAlert, showLoader]);

  const onSubmit = handleSubmit(async (data) => {
    hideAlert();
    showLoader();
    try {
      await request.post('/transactions', {
        count: Number(data.count),
        product_id: data.product_id ? Number(data.product_id) : null,
        transaction_type_id: data.transaction_type_id,
      });
      showAlert('success', translator('data_is_created'));
      reset();
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  });

  return (
    <ZFormScreen onClear={() => reset()} onSubmit={onSubmit}>
      <ZFormSection icon="swap-vert" title={translator('transaction_type')}>
        <Controller
          control={control}
          name="transaction_type_id"
          render={({ field }) => (
            <View accessibilityRole="radiogroup" style={styles.segments}>
              {transactionTypeOptions.map((option) => {
                const isSelected = field.value === option.value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={option.value}
                    onPress={() => field.onChange(option.value)}
                    style={[
                      styles.segment,
                      isSelected && {
                        backgroundColor: withAlpha(option.color, 0.08),
                        borderColor: option.color,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.segmentIcon,
                        { backgroundColor: withAlpha(option.color, isSelected ? 0.16 : 0.08) },
                      ]}
                    >
                      <MaterialIcons color={option.color} name={option.icon} size={22} />
                    </View>
                    <Text style={[styles.segmentText, isSelected && { color: option.color }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </ZFormSection>

      <ZFormSection icon="inventory-2" title={translator('product')}>
        <ZSelect
          clearable
          icon="category"
          label={translator('category')}
          onChange={onCategoryChange}
          options={categoryOptions}
          searchable
          value={categoryFilter}
        />
        <Controller
          control={control}
          name="product_id"
          render={({ field }) => (
            <ZSelect
              clearable
              icon="inventory-2"
              label={translator('product')}
              onChange={field.onChange}
              options={productOptions}
              searchable
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="count"
          render={({ field }) => {
            const step = (delta: number) =>
              field.onChange(String(Math.max(0, (Number(field.value) || 0) + delta)));
            return (
              <ZTextField
                inputMode="numeric"
                label={translator('count')}
                left={
                  <ZIconButton
                    accessibilityLabel={translator('decrease')}
                    color={colors.primary}
                    name="remove"
                    onPress={() => step(-1)}
                    variant="soft"
                  />
                }
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                onSubmitEditing={onSubmit}
                right={
                  <ZIconButton
                    accessibilityLabel={translator('increase')}
                    color={colors.primary}
                    name="add"
                    onPress={() => step(1)}
                    variant="soft"
                  />
                }
                style={styles.countInput}
                value={field.value}
              />
            );
          }}
        />
      </ZFormSection>
    </ZFormScreen>
  );
};

const styles = StyleSheet.create({
  segments: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  segment: {
    ...fieldStyles.box,
    flex: 1,
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  segmentIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  countInput: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CreateTransactionScreen;

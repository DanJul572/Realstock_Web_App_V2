import { useEffect, useState } from 'react';

import { useAlert } from '@/context/AlertContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import { OptionType } from '@/types';

export const toOptions = (items: OptionType[]): OptionType[] =>
  items.map((item) => ({
    label: item.label.toString(),
    value: item.value.toString(),
  }));

const useCategoryOptions = () => {
  const { showAlert } = useAlert();
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    request
      .get<OptionType[]>('/categories/options')
      .then((response) => setCategoryOptions(toOptions(response)))
      .catch((error) => showAlert('error', getErrorMessage(error)));
  }, [showAlert]);

  return categoryOptions;
};

export default useCategoryOptions;

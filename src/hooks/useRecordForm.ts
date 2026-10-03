import { useEffect } from 'react';
import { DefaultValues, FieldValues, useForm } from 'react-hook-form';

import { useAlert } from '@/context/AlertContext';
import { useLoader } from '@/context/LoaderContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';

type OptionsType<TForm extends FieldValues, TRecord> = {
  defaultValues: DefaultValues<TForm>;
  endpoint: string;
  id?: string;
  toForm: (record: TRecord) => TForm;
  toPayload: (form: TForm, isEdit: boolean) => unknown;
};

// Create/edit form for `${endpoint}` (POST) and `${endpoint}/${id}` (GET/PUT).
const useRecordForm = <TForm extends FieldValues, TRecord>({
  defaultValues,
  endpoint,
  id,
  toForm,
  toPayload,
}: OptionsType<TForm, TRecord>) => {
  const { hideAlert, showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();
  const form = useForm<TForm>({ defaultValues });
  const { reset } = form;
  const isEdit = Boolean(id);

  useEffect(() => {
    if (!id) {
      return;
    }
    showLoader();
    request
      .get<TRecord>(`${endpoint}/${id}`)
      .then((record) => reset(toForm(record)))
      .catch((error) => showAlert('error', getErrorMessage(error)))
      .finally(hideLoader);
    // toForm is a plain mapper; reloading only depends on which record is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, id]);

  const onSubmit = form.handleSubmit(async (data) => {
    hideAlert();
    showLoader();
    try {
      const payload = toPayload(data, isEdit);
      if (id) {
        const record = await request.put<TRecord>(`${endpoint}/${id}`, payload);
        reset(toForm(record));
        showAlert('success', translator('data_is_updated'));
      } else {
        await request.post(endpoint, payload);
        reset();
        showAlert('success', translator('data_is_created'));
      }
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  });

  return {
    ...form,
    isEdit,
    onClear: () => reset(),
    onSubmit,
  };
};

export default useRecordForm;

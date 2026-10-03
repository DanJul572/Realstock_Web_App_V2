import { useAlert } from '@/context/AlertContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useLoader } from '@/context/LoaderContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';

// Asks for confirmation, then deletes `${endpoint}/${id}` and calls onDeleted.
const useDeleteRecord = (endpoint: string, onDeleted: () => void) => {
  const confirm = useConfirm();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();

  return async (id: number) => {
    const isConfirmed = await confirm({
      cancelButton: translator('cancel'),
      confirmButton: translator('delete'),
      content: translator('delete_dialog_content'),
      title: translator('delete_dialog_title'),
    });
    if (!isConfirmed) {
      return;
    }

    showLoader();
    try {
      const message = await request.remove<string>(`${endpoint}/${id}`);
      showAlert('success', message);
      onDeleted();
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  };
};

export default useDeleteRecord;

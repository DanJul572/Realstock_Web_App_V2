import { useCallback } from 'react';

import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useLoader } from '@/context/LoaderContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';

const useLogout = () => {
  const { signOut } = useAuth();
  const { showAlert } = useAlert();
  const { hideLoader, showLoader } = useLoader();

  return useCallback(async () => {
    showLoader();
    try {
      await request.get('/logout');
      await signOut();
    } catch (error) {
      showAlert('error', getErrorMessage(error));
    } finally {
      hideLoader();
    }
  }, [hideLoader, showAlert, showLoader, signOut]);
};

export default useLogout;

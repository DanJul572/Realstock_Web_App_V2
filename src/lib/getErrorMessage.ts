import { isAxiosError } from 'axios';

import { ErrorResponseType } from '@/types';

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<ErrorResponseType>(error)) {
    return error.response?.data?.error ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export default getErrorMessage;

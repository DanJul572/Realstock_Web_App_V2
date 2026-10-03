import { AxiosError, create } from 'axios';

import storage, { storageKeys } from '@/lib/storage';

const client = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { Accept: 'application/json' },
});

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

client.interceptors.request.use(async (config) => {
  const token = await storage.getItem(storageKeys.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

type ParamsType = Record<string, string | number | boolean | null | undefined>;

const get = async <T>(endpoint: string, params?: ParamsType): Promise<T> => {
  const response = await client.get<T>(endpoint, { params });
  return response.data;
};

const post = async <T>(endpoint: string, body?: unknown): Promise<T> => {
  const response = await client.post<T>(endpoint, body);
  return response.data;
};

const put = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await client.put<T>(endpoint, body);
  return response.data;
};

const remove = async <T>(endpoint: string): Promise<T> => {
  const response = await client.delete<T>(endpoint);
  return response.data;
};

const request = {
  get,
  post,
  put,
  remove,
};

export default request;

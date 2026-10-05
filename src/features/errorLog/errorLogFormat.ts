import { colors } from '@/constants/theme';

// 5xx are server bugs (red), anything else is a client error (orange).
export const getStatusColor = (statusCode: number): string =>
  statusCode >= 500 ? colors.error : colors.warning;

// "http://host/api/products?page=1" -> "/api/products?page=1"
export const getPath = (url: string): string => url.replace(/^[a-z]+:\/\/[^/]+/i, '') || '/';

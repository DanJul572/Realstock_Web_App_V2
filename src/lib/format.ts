import { getLocales } from 'expo-localization';

const numberFormat = new Intl.NumberFormat(getLocales()[0]?.languageTag ?? 'id-ID');

export const formatNumber = (value: number | string | null | undefined): string => {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormat.format(number) : String(value ?? '-');
};

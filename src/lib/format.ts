import { getLocales } from 'expo-localization';

const numberFormat = new Intl.NumberFormat(getLocales()[0]?.languageTag ?? 'id-ID');

export const formatNumber = (value: number | string | null | undefined): string => {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormat.format(number) : String(value ?? '-');
};

// Prices are always Rupiah, so they use the Indonesian format whatever the
// device language is.
const currencyFormat = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// 100000 -> "Rp. 100.000,00"
export const formatCurrency = (value: number | string | null | undefined): string => {
  const number = Number(value);
  return Number.isFinite(number) ? `Rp. ${currencyFormat.format(number)}` : String(value ?? '-');
};

const dateTimeFormat = new Intl.DateTimeFormat(getLocales()[0]?.languageTag ?? 'id-ID', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

// Laravel timestamps are UTC ISO strings ("2026-10-04T05:00:00.000000Z");
// they are shown in the device time zone. Microseconds are cut to
// milliseconds because not every JS engine parses more digits.
export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return '-';
  }
  const date = new Date(value.replace(/(\.\d{3})\d+/, '$1'));
  return Number.isNaN(date.getTime()) ? value : dateTimeFormat.format(date);
};

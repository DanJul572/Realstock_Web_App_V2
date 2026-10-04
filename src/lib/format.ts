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

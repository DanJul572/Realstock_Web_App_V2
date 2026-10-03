import translator from '@/lib/translator';
import { ColumnType, TransactionRowType } from '@/types';

const transactionColumns = (): ColumnType<TransactionRowType>[] => [
  { field: 'user_name', label: translator('user') },
  { field: 'product_name', label: translator('product') },
  { field: 'product_type', label: translator('type') },
  { field: 'product_size', label: translator('size') },
  { field: 'transaction_type_name', label: translator('transaction_type') },
  { field: 'transaction_count', label: translator('count') },
  { field: 'transaction_created_at', label: translator('created_at') },
];

// The API only returns the type's display name, so detect "out" by name
// (covers English/Indonesian names such as "Out" or "Keluar").
export const isOutgoing = (row: TransactionRowType): boolean =>
  /out|keluar/i.test(row.transaction_type_name ?? '');

export default transactionColumns;

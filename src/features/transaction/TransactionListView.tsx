import { ReactNode } from 'react';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import transactionColumns, { isOutgoing } from '@/features/transaction/transactionColumns';
import useDeleteRecord from '@/hooks/useDeleteRecord';
import usePaginatedList from '@/hooks/usePaginatedList';
import { formatNumber } from '@/lib/format';
import { TransactionRowType } from '@/types';

type PropsType = {
  enableAddButton?: boolean;
  enableLoadMore?: boolean;
  enableToolbar?: boolean;
  header?: ReactNode;
  onAdd?: () => void;
};

// Transactions newest first. The API pages by 10, so with load more turned off
// this shows the 10 latest transactions.
const TransactionListView = (props: PropsType) => {
  const { isAdmin } = useAuth();

  const transactions = usePaginatedList<TransactionRowType>({
    defaultSort: { field: 'transaction_created_at', order: 'desc' },
    endpoint: '/transactions',
  });
  const onDelete = useDeleteRecord('/transactions', transactions.reload);

  return (
    <ZListView
      {...props}
      columns={transactionColumns()}
      enableDeleteButton={isAdmin}
      getSubtitle={(item) => `${item.user_name} · ${item.transaction_created_at}`}
      getTitle={(item) => item.product_name}
      idField="transaction_id"
      list={transactions}
      onDelete={onDelete}
      renderLeading={(item) => {
        const isOut = isOutgoing(item);
        return (
          <ZAvatar
            color={isOut ? colors.error : colors.success}
            icon={isOut ? 'north-east' : 'south-west'}
            shape="circle"
          />
        );
      }}
      renderMeta={(item) => {
        const isOut = isOutgoing(item);
        const color = isOut ? colors.error : colors.success;
        return (
          <>
            <ZBadge
              color={color}
              label={`${isOut ? '−' : '+'}${formatNumber(item.transaction_count)}`}
            />
            <ZBadge color={color} label={item.transaction_type_name} />
            <ZBadge
              color={colors.textMuted}
              label={`${item.product_type} · ${item.product_size}`}
            />
          </>
        );
      }}
    />
  );
};

export default TransactionListView;

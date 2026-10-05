import { useRouter } from 'expo-router';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors } from '@/constants/theme';
import { getPath, getStatusColor } from '@/features/errorLog/errorLogFormat';
import usePaginatedList from '@/hooks/usePaginatedList';
import { formatDateTime } from '@/lib/format';
import translator from '@/lib/translator';
import { ColumnType, ErrorLogRowType } from '@/types';

const columns: ColumnType<ErrorLogRowType>[] = [
  {
    field: 'created_at',
    format: (value) => formatDateTime(String(value)),
    label: translator('time'),
  },
  { field: 'status_code', label: translator('status_code') },
  { field: 'method', label: translator('method') },
  { field: 'url', label: translator('url') },
  { field: 'message', label: translator('message') },
  { field: 'user_name', label: translator('user') },
];

// API requests that ended with a non-2xx status, newest first.
const ErrorLogListScreen = () => {
  const router = useRouter();
  const logs = usePaginatedList<ErrorLogRowType>({
    defaultSort: { field: 'created_at', order: 'desc' },
    endpoint: '/error-logs',
  });

  return (
    <ZListView
      columns={columns}
      enableDetailButton
      getSubtitle={(item) =>
        [item.message, formatDateTime(item.created_at)].filter(Boolean).join(' · ')
      }
      getTitle={(item) => `${item.method} ${getPath(item.url)}`}
      idField="id"
      list={logs}
      onDetail={(id) => router.push({ pathname: '/error-log/[id]', params: { id } })}
      renderLeading={(item) => (
        <ZAvatar color={getStatusColor(item.status_code)} icon="error-outline" shape="circle" />
      )}
      renderMeta={(item) => (
        <>
          <ZBadge color={getStatusColor(item.status_code)} label={String(item.status_code)} />
          <ZBadge
            color={colors.textMuted}
            icon="person"
            label={item.user_name ?? translator('system')}
          />
        </>
      )}
    />
  );
};

export default ErrorLogListScreen;

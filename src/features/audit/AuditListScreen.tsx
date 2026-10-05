import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors } from '@/constants/theme';
import {
  auditEntities,
  auditEvents,
  getActorName,
  isAuditEntityType,
} from '@/features/audit/auditConfig';
import usePaginatedList from '@/hooks/usePaginatedList';
import { formatDateTime } from '@/lib/format';
import translator from '@/lib/translator';
import { AuditEntityType, AuditEventType, AuditLogRowType, ColumnType } from '@/types';

const columns: ColumnType<AuditLogRowType>[] = [
  {
    field: 'created_at',
    format: (value) => formatDateTime(String(value)),
    label: translator('time'),
  },
  {
    field: 'event',
    format: (value) => auditEvents[value as AuditEventType]?.label ?? String(value),
    label: translator('event'),
  },
  { field: 'label', label: translator('name') },
  { field: 'auditable_id', label: translator('record_id') },
  { field: 'user_name', label: translator('user') },
];

const AuditListScreen = () => {
  const { type } = useLocalSearchParams<{ type: string }>();
  if (!isAuditEntityType(type)) {
    return <Redirect href="/audit" />;
  }
  return <AuditList type={type} />;
};

// Change history of one table, newest first.
const AuditList = ({ type }: { type: AuditEntityType }) => {
  const router = useRouter();
  const logs = usePaginatedList<AuditLogRowType>({
    defaultParams: { type },
    defaultSort: { field: 'created_at', order: 'desc' },
    endpoint: '/audit-logs',
  });

  return (
    <>
      <Stack.Screen
        options={{ title: `${translator('audit_trail')} · ${auditEntities[type].label}` }}
      />
      <ZListView
        columns={columns}
        enableDetailButton
        getSubtitle={(item) =>
          `${getActorName(type, item.user_name)} · ${formatDateTime(item.created_at)}`
        }
        getTitle={(item) => item.label ?? `#${item.auditable_id ?? '-'}`}
        idField="id"
        list={logs}
        onDetail={(id) => router.push({ pathname: '/audit/detail/[id]', params: { id } })}
        renderLeading={(item) => (
          <ZAvatar
            color={auditEvents[item.event].color}
            icon={auditEvents[item.event].icon}
            shape="circle"
          />
        )}
        renderMeta={(item) => (
          <>
            <ZBadge color={auditEvents[item.event].color} label={auditEvents[item.event].label} />
            {item.auditable_id !== null && (
              <ZBadge color={colors.textMuted} icon="tag" label={`ID ${item.auditable_id}`} />
            )}
          </>
        )}
      />
    </>
  );
};

export default AuditListScreen;

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import { ZFormSection } from '@/components/ZFormScreen';
import ZInfoList from '@/components/ZInfoList';
import { colors, contentMaxWidth, radius, shadows, spacing, typography } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useLoader } from '@/context/LoaderContext';
import useBottomInset from '@/hooks/useBottomInset';
import {
  auditEntities,
  auditEvents,
  formatFieldValue,
  getActorName,
  getFieldLabel,
  isChangeEvent,
} from '@/features/audit/auditConfig';
import { formatDateTime } from '@/lib/format';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { AuditEventType, AuditLogDetailType } from '@/types';

const AuditDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const bottomInset = useBottomInset();
  const { hideLoader, showLoader } = useLoader();
  const [log, setLog] = useState<AuditLogDetailType | null>(null);

  useEffect(() => {
    showLoader();
    request
      .get<AuditLogDetailType>(`/audit-logs/${id}`)
      .then(setLog)
      .catch((error) => showAlert('error', getErrorMessage(error)))
      .finally(hideLoader);
  }, [hideLoader, id, showAlert, showLoader]);

  if (!log) {
    return null;
  }

  const entity = auditEntities[log.auditable_type];
  const event = auditEvents[log.event];
  const oldValues = log.old_values ?? {};
  const newValues = log.new_values ?? {};
  // The record id is already shown in the summary.
  const fields = [...new Set([...Object.keys(newValues), ...Object.keys(oldValues)])].filter(
    (field) => field !== 'id'
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + bottomInset }]}
      style={styles.screen}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <ZAvatar color={entity.color} icon={entity.icon} size={52} />
          <View style={styles.headerText}>
            <Text style={styles.entity}>{entity.label}</Text>
            <Text style={styles.title}>{log.label ?? `#${log.auditable_id ?? '-'}`}</Text>
          </View>
        </View>
        <ZBadge color={event.color} icon={event.icon} label={event.label} />
        <ZInfoList
          items={[
            { label: translator('record_id'), value: log.auditable_id?.toString() },
            { label: translator('user'), value: getActorName(log.auditable_type, log.user?.name) },
            { label: translator('time'), value: formatDateTime(log.created_at) },
            { label: translator('ip_address'), value: log.ip_address },
            { label: translator('url'), monospace: true, value: log.url },
          ]}
        />
      </View>

      {!isChangeEvent(log.event) ? (
        <ZFormSection icon="info-outline" title={translator('detail')}>
          <ZInfoList
            items={fields.map((field) => ({
              label: getFieldLabel(field),
              value: formatFieldValue(field, newValues[field]),
            }))}
          />
        </ZFormSection>
      ) : (
        <ZFormSection icon="compare-arrows" title={translator('changes')}>
          {fields.length === 0 ? (
            <Text style={styles.empty}>{translator('no_changes')}</Text>
          ) : (
            fields.map((field) => (
              <FieldChange
                event={log.event}
                field={field}
                key={field}
                newValue={formatFieldValue(field, newValues[field])}
                oldValue={formatFieldValue(field, oldValues[field])}
              />
            ))
          )}
        </ZFormSection>
      )}
    </ScrollView>
  );
};

type FieldChangePropsType = {
  event: AuditEventType;
  field: string;
  newValue: string;
  oldValue: string;
};

// Before and after are stacked so long values stay readable on phones.
// A created record has no "before", a deleted one has no "after".
const FieldChange = ({ event, field, newValue, oldValue }: FieldChangePropsType) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{getFieldLabel(field)}</Text>
    {event !== 'created' && (
      <ValueBox
        background={colors.errorSoft}
        color={colors.error}
        label={translator('before')}
        value={oldValue}
      />
    )}
    {event !== 'deleted' && (
      <ValueBox
        background={colors.successSoft}
        color={colors.success}
        label={translator('after')}
        value={newValue}
      />
    )}
  </View>
);

type ValueBoxPropsType = {
  background: string;
  color: string;
  label: string;
  value: string;
};

const ValueBox = ({ background, color, label, value }: ValueBoxPropsType) => (
  <View style={[styles.valueBox, { backgroundColor: background }]}>
    <Text style={[styles.valueLabel, { color }]}>{label}</Text>
    <Text selectable style={styles.value}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  card: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  entity: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  empty: {
    color: colors.textMuted,
  },
  field: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
  },
  valueBox: {
    borderRadius: radius.sm,
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  valueLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AuditDetailScreen;

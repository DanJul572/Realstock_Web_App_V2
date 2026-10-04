import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ZBadge from '@/components/ZBadge';
import { ZFormSection } from '@/components/ZFormScreen';
import ZInfoList from '@/components/ZInfoList';
import {
  breakAll,
  colors,
  contentMaxWidth,
  radius,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useLoader } from '@/context/LoaderContext';
import useBottomInset from '@/hooks/useBottomInset';
import { getPath, getStatusColor } from '@/features/errorLog/errorLogFormat';
import { formatDateTime } from '@/lib/format';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { ErrorLogDetailType } from '@/types';

const ErrorLogDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useAlert();
  const bottomInset = useBottomInset();
  const { hideLoader, showLoader } = useLoader();
  const [log, setLog] = useState<ErrorLogDetailType | null>(null);

  useEffect(() => {
    showLoader();
    request
      .get<ErrorLogDetailType>(`/error-logs/${id}`)
      .then(setLog)
      .catch((error) => showAlert('error', getErrorMessage(error)))
      .finally(hideLoader);
  }, [hideLoader, id, showAlert, showLoader]);

  if (!log) {
    return null;
  }

  const statusColor = getStatusColor(log.status_code);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + bottomInset }]}
      style={styles.screen}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <ZBadge color={statusColor} icon="error-outline" label={String(log.status_code)} />
          <Text style={styles.method}>{log.method}</Text>
        </View>
        <Text selectable style={styles.path}>
          {getPath(log.url)}
        </Text>
        {log.message ? (
          <Text style={[styles.message, { color: statusColor }]}>{log.message}</Text>
        ) : null}
        <ZInfoList
          items={[
            { label: translator('time'), value: formatDateTime(log.created_at) },
            { label: translator('user'), value: log.user?.name ?? translator('system') },
            { label: translator('ip_address'), value: log.ip_address },
            { label: translator('user_agent'), value: log.user_agent },
            { label: translator('url'), monospace: true, value: log.url },
          ]}
        />
      </View>

      {log.request_body ? (
        <ZFormSection icon="data-object" title={translator('request_body')}>
          <CodeBlock value={JSON.stringify(log.request_body, null, 2)} />
        </ZFormSection>
      ) : null}

      {log.exception_class ? (
        <ZFormSection icon="bug-report" title={translator('exception')}>
          <ZInfoList
            items={[
              { label: 'Class', monospace: true, value: log.exception_class },
              { label: translator('message'), value: log.exception_message },
              { label: translator('location'), monospace: true, value: log.exception_location },
            ]}
          />
          {log.trace ? (
            <View style={styles.traceSection}>
              <Text style={styles.traceTitle}>{translator('trace')}</Text>
              <ScrollView nestedScrollEnabled style={styles.trace}>
                <CodeBlock value={log.trace} />
              </ScrollView>
            </View>
          ) : null}
        </ZFormSection>
      ) : null}
    </ScrollView>
  );
};

const CodeBlock = ({ value }: { value: string }) => (
  <Text selectable style={styles.code}>
    {value}
  </Text>
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
    gap: spacing.sm,
  },
  method: {
    ...typography.label,
    color: colors.textMuted,
  },
  path: {
    ...typography.subtitle,
    ...breakAll,
    color: colors.text,
    fontFamily: 'monospace',
  },
  message: {
    fontWeight: '600',
  },
  traceSection: {
    gap: spacing.sm,
  },
  traceTitle: {
    ...typography.label,
    color: colors.text,
  },
  trace: {
    maxHeight: 360,
  },
  code: {
    ...breakAll,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: spacing.md,
  },
});

export default ErrorLogDetailScreen;

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  contentMaxWidth,
  radius,
  shadows,
  spacing,
  typography,
  withAlpha,
} from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import useBottomInset from '@/hooks/useBottomInset';
import { auditEntities, auditEntityTypes } from '@/features/audit/auditConfig';
import { formatNumber } from '@/lib/format';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import translator from '@/lib/translator';
import { AuditSummaryType } from '@/types';

// Sub menu of the audit trail: one entry per audited table.
const AuditMenuScreen = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const bottomInset = useBottomInset();
  const [summary, setSummary] = useState<AuditSummaryType | null>(null);

  useFocusEffect(
    useCallback(() => {
      request
        .get<AuditSummaryType>('/audit-logs/summary')
        .then(setSummary)
        .catch((error) => showAlert('error', getErrorMessage(error)));
    }, [showAlert])
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + bottomInset }]}
      style={styles.screen}
    >
      <Text style={styles.hint}>{translator('audit_trail_hint')}</Text>
      {auditEntityTypes.map((type) => {
        const entity = auditEntities[type];
        return (
          <Pressable
            accessibilityRole="button"
            key={type}
            onPress={() => router.push({ pathname: '/audit/[type]', params: { type } })}
            style={({ hovered, pressed }) => [styles.card, (hovered || pressed) && styles.pressed]}
          >
            <View style={[styles.icon, { backgroundColor: withAlpha(entity.color, 0.12) }]}>
              <MaterialIcons color={entity.color} name={entity.icon} size={26} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.title}>{entity.label}</Text>
              <Text style={styles.count}>
                {summary ? `${formatNumber(summary[type])} ${translator('logs')}` : '…'}
              </Text>
            </View>
            <MaterialIcons color={colors.textSubtle} name="chevron-right" size={24} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  hint: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  card: {
    ...shadows.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  cardText: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default AuditMenuScreen;

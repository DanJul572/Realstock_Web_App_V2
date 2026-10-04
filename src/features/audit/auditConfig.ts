import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';

import { colors } from '@/constants/theme';
import { formatCurrency, formatNumber } from '@/lib/format';
import translator from '@/lib/translator';
import { AuditEntityType, AuditEventType } from '@/types';

type IconNameType = ComponentProps<typeof MaterialIcons>['name'];

type AppearanceType = {
  color: string;
  icon: IconNameType;
  label: string;
};

// Same icons and colors as the matching tiles in the dashboard menu.
export const auditEntities: Record<AuditEntityType, AppearanceType> = {
  product: { color: colors.primary, icon: 'inventory-2', label: translator('product') },
  category: { color: colors.info, icon: 'category', label: translator('category') },
  user: { color: colors.error, icon: 'group', label: translator('user') },
  transaction: { color: colors.success, icon: 'receipt-long', label: translator('transaction') },
  login: { color: colors.warning, icon: 'login', label: translator('login_history') },
};

export const auditEntityTypes = Object.keys(auditEntities) as AuditEntityType[];

export const isAuditEntityType = (value: unknown): value is AuditEntityType =>
  typeof value === 'string' && value in auditEntities;

export const auditEvents: Record<AuditEventType, AppearanceType> = {
  created: {
    color: colors.success,
    icon: 'add-circle-outline',
    label: translator('event_created'),
  },
  updated: { color: colors.warning, icon: 'edit', label: translator('event_updated') },
  deleted: { color: colors.error, icon: 'delete-outline', label: translator('event_deleted') },
  login: { color: colors.success, icon: 'login', label: translator('event_login') },
  login_failed: { color: colors.error, icon: 'block', label: translator('event_login_failed') },
  logout: { color: colors.textMuted, icon: 'logout', label: translator('event_logout') },
};

// Data changes show before/after values; login events only show their details.
// Data changes without a user were made by the system (e.g. seeders); a
// failed login without a user came from an unknown email.
export const getActorName = (type: AuditEntityType, userName: string | null | undefined) =>
  userName ?? (type === 'login' ? '-' : translator('system'));

export const isChangeEvent = (event: AuditEventType): boolean =>
  event === 'created' || event === 'updated' || event === 'deleted';

type FieldType = {
  format?: (value: string | number) => string;
  label: string;
};

const roleNames: Record<string, string> = { '1': 'Admin', '2': 'User' };
const transactionTypeNames: Record<string, string> = {
  '1': translator('in'),
  '2': translator('out'),
};

// Labels and value formats of known columns; other columns show the raw
// column name and value.
const auditFields: Record<string, FieldType> = {
  category_id: { label: `${translator('category')} ID` },
  code: { label: translator('code') },
  count: { format: formatNumber, label: translator('count') },
  email: { label: translator('email') },
  image: { label: translator('image') },
  name: { label: translator('name') },
  password: { label: translator('password') },
  price_1: { format: formatCurrency, label: `${translator('price')} 1` },
  price_2: { format: formatCurrency, label: `${translator('price')} 2` },
  product_id: { label: `${translator('product')} ID` },
  role_id: {
    format: (value) => roleNames[String(value)] ?? String(value),
    label: translator('role_id'),
  },
  size: { label: translator('size') },
  stock: { format: formatNumber, label: translator('stock') },
  surface: { label: translator('surface') },
  transaction_type_id: {
    format: (value) => transactionTypeNames[String(value)] ?? String(value),
    label: translator('transaction_type'),
  },
  type: { label: translator('type') },
  user_id: { label: `${translator('user')} ID` },
};

export const getFieldLabel = (field: string): string => auditFields[field]?.label ?? field;

export const formatFieldValue = (
  field: string,
  value: string | number | boolean | null | undefined
): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const format = auditFields[field]?.format;
  return format && typeof value !== 'boolean' ? format(value) : String(value);
};

export type ErrorResponseType = {
  error: string;
  statusCode: number;
};

export type SortOrderType = 'asc' | 'desc';

export type SortType = {
  field: string;
  order: SortOrderType;
};

export type OptionType = {
  label: string;
  value: string;
};

export type ColumnType<T> = {
  field: keyof T & string;
  // Display text for the value; defaults to the raw value.
  format?: (value: T[keyof T]) => string;
  label: string;
};

export type PaginatedResponseType<T> = {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type AlertType = 'error' | 'success';

export type UserType = {
  email_verified_at: string;
  email: string;
  id: number;
  name: string;
  role_id: number;
};

export type LoginResponseType = {
  token: string;
  user: UserType;
};

export type CategoryType = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ProductType = {
  category_id: number;
  code: string | null;
  created_at: string;
  id: number;
  image: string | null;
  name: string;
  price_1: number;
  price_2: number;
  size: string;
  stock: number;
  surface: string;
  type: string;
  updated_at: string;
};

export type ProductDetailType = ProductType & {
  category: CategoryType;
};

export type ProductRowType = {
  category_name: string;
  code?: string | null;
  id: number;
  image?: string | null;
  price_1: number;
  price_2: number;
  product_name: string;
  size: string;
  stock: number;
  type: string;
};

export type TransactionRowType = {
  product_name: string;
  product_size: string;
  product_type: string;
  transaction_count: number;
  transaction_created_at: string;
  transaction_id: number;
  transaction_type_name: string;
  user_name: string;
};

export type AuditEntityType = 'category' | 'login' | 'product' | 'transaction' | 'user';

export type AuditEventType =
  'created' | 'deleted' | 'login' | 'login_failed' | 'logout' | 'updated';

export type AuditValuesType = Record<string, string | number | boolean | null>;

export type AuditSummaryType = Record<AuditEntityType, number>;

export type AuditLogRowType = {
  // Null for a failed login with an unknown email.
  auditable_id: number | null;
  created_at: string;
  event: AuditEventType;
  id: number;
  label: string | null;
  user_name: string | null;
};

export type LogUserType = {
  id: number;
  name: string;
};

export type AuditLogDetailType = {
  auditable_id: number | null;
  auditable_type: AuditEntityType;
  created_at: string;
  event: AuditEventType;
  id: number;
  ip_address: string | null;
  label: string | null;
  new_values: AuditValuesType | null;
  old_values: AuditValuesType | null;
  url: string | null;
  user: LogUserType | null;
  user_agent: string | null;
};

export type ErrorLogRowType = {
  created_at: string;
  id: number;
  message: string | null;
  method: string;
  status_code: number;
  url: string;
  user_name: string | null;
};

export type ErrorLogDetailType = Omit<ErrorLogRowType, 'user_name'> & {
  exception_class: string | null;
  exception_location: string | null;
  exception_message: string | null;
  ip_address: string | null;
  request_body: Record<string, unknown> | null;
  trace: string | null;
  user: LogUserType | null;
  user_agent: string | null;
};

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

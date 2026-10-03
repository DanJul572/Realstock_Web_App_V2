import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAlert } from '@/context/AlertContext';
import getErrorMessage from '@/lib/getErrorMessage';
import request from '@/lib/request';
import { PaginatedResponseType, SortType } from '@/types';

type ExtraParamsType = Record<string, string | number | boolean>;

type OptionsType = {
  defaultParams?: ExtraParamsType;
  defaultSort: SortType;
  endpoint: string;
};

export type PaginatedListType<T> = {
  isLoading: boolean;
  isRefreshing: boolean;
  loadMore: () => void;
  params: ExtraParamsType;
  quickFilter: string;
  refresh: () => void;
  reload: () => void;
  rows: T[];
  setParams: (params: ExtraParamsType) => void;
  setQuickFilter: (value: string) => void;
  setSort: (sort: SortType) => void;
  sort: SortType;
  total: number;
};

// Server-side paginated list (Laravel paginator) loaded page by page for
// infinite scrolling. Search, sort, params and reloads restart from page 1.
// Loading flags are raised by whatever triggers a fetch, so the fetch itself
// only updates state once the response arrives.
const usePaginatedList = <T>({
  defaultParams = {},
  defaultSort,
  endpoint,
}: OptionsType): PaginatedListType<T> => {
  const { showAlert } = useAlert();

  const [quickFilter, setQuickFilterState] = useState('');
  const [sort, setSortState] = useState<SortType>(defaultSort);
  const [params, setParamsState] = useState<ExtraParamsType>(defaultParams);
  const [reloadKey, setReloadKey] = useState(0);
  const [rows, setRows] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ignores responses from requests that were superseded by a newer one.
  const latestRequestId = useRef(0);
  const hasFocused = useRef(false);

  const fetchPage = useCallback(
    (pageToLoad: number) => {
      const requestId = ++latestRequestId.current;
      const isLatest = () => requestId === latestRequestId.current;

      request
        .get<PaginatedResponseType<T>>(endpoint, {
          ...params,
          order: sort.order,
          orderBy: sort.field,
          page: pageToLoad,
          quickFilter: quickFilter || undefined,
        })
        .then((response) => {
          if (!isLatest()) {
            return;
          }
          // Rows and loading flags change together so the list never shows
          // new rows while still flagged as loading (which blocks loadMore).
          setRows((prevRows) =>
            pageToLoad === 1 ? response.data : [...prevRows, ...response.data]
          );
          setPage(response.current_page);
          setLastPage(response.last_page);
          setTotal(response.total);
          setIsLoading(false);
          setIsRefreshing(false);
        })
        .catch((error) => {
          if (!isLatest()) {
            return;
          }
          showAlert('error', getErrorMessage(error));
          setIsLoading(false);
          setIsRefreshing(false);
        });
    },
    [endpoint, params, quickFilter, showAlert, sort]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage, reloadKey]);

  const reload = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Reload when coming back to the screen (e.g. after creating or editing).
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        setIsLoading(true);
        setReloadKey((key) => key + 1);
      }
      hasFocused.current = true;
    }, [])
  );

  const refresh = () => {
    setIsRefreshing(true);
    reload();
  };

  const loadMore = () => {
    if (!isLoading && page > 0 && page < lastPage) {
      setIsLoading(true);
      fetchPage(page + 1);
    }
  };

  // Stable so the debounced search box can depend on it; callers only pass a
  // value that differs from the current filter.
  const setQuickFilter = useCallback((value: string) => {
    setIsLoading(true);
    setQuickFilterState(value);
  }, []);

  const setSort = (newSort: SortType) => {
    setIsLoading(true);
    setSortState(newSort);
  };

  const setParams = (newParams: ExtraParamsType) => {
    setIsLoading(true);
    setParamsState(newParams);
  };

  return {
    isLoading,
    isRefreshing,
    loadMore,
    params,
    quickFilter,
    refresh,
    reload,
    rows,
    setParams,
    setQuickFilter,
    setSort,
    sort,
    total,
  };
};

export default usePaginatedList;

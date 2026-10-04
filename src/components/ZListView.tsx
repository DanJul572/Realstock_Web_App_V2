import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ZAvatar from '@/components/ZAvatar';
import ZIconButton from '@/components/ZIconButton';
import ZSelect from '@/components/ZSelect';
import ZTextField from '@/components/ZTextField';
import { colors, contentMaxWidth, radius, shadows, spacing, typography } from '@/constants/theme';
import { PaginatedListType } from '@/hooks/usePaginatedList';
import useTabBarOverlap from '@/hooks/useTabBarOverlap';
import translator from '@/lib/translator';
import { ColumnType } from '@/types';

const searchDebounceMs = 1000;
// Bottom space so the last row can scroll clear of the add button.
const fabClearance = 96;

type PropsType<T> = {
  columns: ColumnType<T>[];
  enableAddButton?: boolean;
  enableDeleteButton?: boolean;
  enableDetailButton?: boolean;
  enableEditButton?: boolean;
  // Off to show only the first page (e.g. a "latest records" preview).
  enableLoadMore?: boolean;
  // Off to hide the search and sort controls.
  enableToolbar?: boolean;
  getSubtitle?: (item: T) => string;
  getTitle: (item: T) => string;
  header?: ReactNode;
  idField: keyof T & string;
  list: PaginatedListType<T>;
  onAdd?: () => void;
  onDelete?: (id: number) => void;
  onDetail?: (id: number) => void;
  onEdit?: (id: number) => void;
  renderLeading?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
};

const ZListView = <T,>(props: PropsType<T>) => {
  const { enableLoadMore = true, enableToolbar = true, list } = props;
  const tabBarOverlap = useTabBarOverlap();
  const showFab = Boolean(props.enableAddButton && props.onAdd);
  const isFirstLoad = list.isLoading && !list.isRefreshing && list.rows.length === 0;

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (showFab ? fabClearance : spacing.lg) + tabBarOverlap },
        ]}
        data={list.rows}
        keyExtractor={(item) => String(item[props.idField])}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={isFirstLoad ? <SkeletonList /> : list.isLoading ? null : <EmptyState />}
        ListFooterComponent={
          list.isLoading && !list.isRefreshing && list.rows.length > 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {props.header}
            {enableToolbar && <Toolbar columns={props.columns} list={list} />}
          </View>
        }
        onEndReached={enableLoadMore ? list.loadMore : undefined}
        onEndReachedThreshold={0.5}
        onRefresh={list.refresh}
        refreshing={list.isRefreshing}
        renderItem={({ item }) => <ListItem {...props} item={item} />}
      />
      {showFab && (
        <Pressable
          accessibilityRole="button"
          onPress={props.onAdd}
          style={({ hovered, pressed }) => [
            styles.fab,
            hovered && styles.fabHovered,
            pressed && styles.fabPressed,
          ]}
        >
          <MaterialIcons color={colors.onPrimary} name="add" size={22} />
          <Text style={styles.fabText}>{translator('add_record')}</Text>
        </Pressable>
      )}
    </View>
  );
};

type ToolbarPropsType<T> = Pick<PropsType<T>, 'columns' | 'list'>;

const Toolbar = <T,>({ columns, list }: ToolbarPropsType<T>) => {
  const [search, setSearch] = useState(list.quickFilter);
  const { quickFilter, setQuickFilter } = list;

  useEffect(() => {
    const keyword = search.trim();
    if (keyword === quickFilter) {
      return;
    }
    const timerId = setTimeout(() => setQuickFilter(keyword), searchDebounceMs);
    return () => clearTimeout(timerId);
  }, [quickFilter, search, setQuickFilter]);

  const sortOptions = columns.map((column) => ({ label: column.label, value: column.field }));
  const isAscending = list.sort.order === 'asc';

  return (
    <View style={styles.toolbar}>
      <ZTextField
        icon="search"
        onChangeText={setSearch}
        placeholder={`${translator('search')}...`}
        right={
          search ? (
            <ZIconButton
              accessibilityLabel={translator('clear')}
              color={colors.textSubtle}
              name="close"
              onPress={() => setSearch('')}
              size={18}
            />
          ) : null
        }
        style={styles.searchInput}
        value={search}
      />
      <View style={styles.sortRow}>
        <ZSelect
          icon="sort"
          label={translator('sort')}
          onChange={(field) => field && list.setSort({ ...list.sort, field })}
          options={sortOptions}
          value={list.sort.field}
          variant="chip"
        />
        <Pressable
          accessibilityLabel={translator(isAscending ? 'ascending' : 'descending')}
          accessibilityRole="button"
          onPress={() => list.setSort({ ...list.sort, order: isAscending ? 'desc' : 'asc' })}
          style={({ hovered }) => [styles.orderChip, hovered && styles.orderChipHovered]}
        >
          <MaterialIcons
            color={colors.primary}
            name={isAscending ? 'arrow-upward' : 'arrow-downward'}
            size={16}
          />
          <Text style={styles.orderText}>
            {translator(isAscending ? 'ascending' : 'descending')}
          </Text>
        </Pressable>
        <Text style={styles.total}>
          {list.total} {translator('results')}
        </Text>
      </View>
    </View>
  );
};

type ListItemPropsType<T> = PropsType<T> & { item: T };

const ListItem = <T,>(props: ListItemPropsType<T>) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { item } = props;
  const id = Number(item[props.idField]);
  const title = props.getTitle(item);
  const subtitle = props.getSubtitle?.(item);
  const hasActions =
    (props.enableDetailButton && props.onDetail) ||
    (props.enableEditButton && props.onEdit) ||
    (props.enableDeleteButton && props.onDelete);

  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        {props.renderLeading ? props.renderLeading(item) : <ZAvatar name={title} />}
        <View style={styles.cardText}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
          {props.renderMeta && <View style={styles.meta}>{props.renderMeta(item)}</View>}
        </View>
        <ZIconButton
          accessibilityLabel={translator('more')}
          color={colors.textMuted}
          name={isExpanded ? 'expand-less' : 'expand-more'}
          onPress={() => setIsExpanded((value) => !value)}
        />
      </View>

      {isExpanded && (
        <View style={styles.description}>
          {props.columns.map((column, index) => (
            <View
              key={column.field}
              style={[styles.descriptionRow, index > 0 && styles.descriptionDivider]}
            >
              <Text style={styles.descriptionLabel}>{column.label}</Text>
              <Text style={styles.descriptionValue}>
                {column.format
                  ? column.format(item[column.field])
                  : String(item[column.field] ?? '-')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {hasActions && (
        <View style={styles.actions}>
          {props.enableDetailButton && props.onDetail && (
            <ZIconButton
              accessibilityLabel={translator('detail')}
              color={colors.info}
              name="visibility"
              onPress={() => props.onDetail?.(id)}
              variant="soft"
            />
          )}
          {props.enableEditButton && props.onEdit && (
            <ZIconButton
              accessibilityLabel={translator('edit')}
              color={colors.warning}
              name="edit"
              onPress={() => props.onEdit?.(id)}
              variant="soft"
            />
          )}
          {props.enableDeleteButton && props.onDelete && (
            <ZIconButton
              accessibilityLabel={translator('delete')}
              color={colors.error}
              name="delete-outline"
              onPress={() => props.onDelete?.(id)}
              variant="soft"
            />
          )}
        </View>
      )}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <MaterialIcons color={colors.primary} name="inbox" size={36} />
    </View>
    <Text style={styles.emptyTitle}>{translator('no_row')}</Text>
    <Text style={styles.emptyHint}>{translator('no_row_hint')}</Text>
  </View>
);

const SkeletonList = () => {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 700, toValue: 1, useNativeDriver }),
        Animated.timing(opacity, { duration: 700, toValue: 0.5, useNativeDriver }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonList, { opacity }]}>
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={[styles.card, styles.cardMain]}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.cardText}>
            <View style={[styles.skeletonLine, styles.skeletonTitle]} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  toolbar: {
    gap: spacing.md,
  },
  searchInput: {
    paddingVertical: spacing.sm + 2,
  },
  sortRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  orderChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  orderChipHovered: {
    borderColor: colors.primaryTint,
  },
  orderText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  total: {
    color: colors.textMuted,
    flexShrink: 0,
    fontSize: 13,
    marginLeft: 'auto',
  },
  footer: {
    marginVertical: spacing.lg,
  },
  card: {
    ...shadows.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  description: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  descriptionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  descriptionDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  descriptionLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  descriptionValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.round,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  skeletonList: {
    gap: spacing.md,
  },
  skeletonAvatar: {
    backgroundColor: colors.skeleton,
    borderRadius: radius.md,
    height: 48,
    width: 48,
  },
  skeletonLine: {
    backgroundColor: colors.skeleton,
    borderRadius: radius.round,
    height: 10,
    width: '45%',
  },
  skeletonTitle: {
    height: 14,
    marginBottom: spacing.xs,
    width: '70%',
  },
  fab: {
    ...shadows.lg,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    bottom: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl - 4,
    paddingVertical: spacing.md + 2,
    position: 'absolute',
    right: spacing.lg,
  },
  fabHovered: {
    backgroundColor: colors.primaryDark,
  },
  fabPressed: {
    transform: [{ scale: 0.97 }],
  },
  fabText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ZListView;

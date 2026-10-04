import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ZTextField, { fieldStyles } from '@/components/ZTextField';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import useBackToClose from '@/hooks/useBackToClose';
import translator from '@/lib/translator';
import { OptionType } from '@/types';

// Dragging the sheet header down this far (px) or this fast (px/ms) closes it.
const closeDragDistance = 100;
const closeDragVelocity = 0.8;
const useNativeDriver = Platform.OS !== 'web';

type PropsType = {
  clearable?: boolean;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  label?: string;
  onChange: (value: string | null) => void;
  options: OptionType[];
  placeholder?: string;
  searchable?: boolean;
  value: string | null | undefined;
  variant?: 'field' | 'chip';
};

const ZSelect = ({
  clearable,
  icon,
  label,
  onChange,
  options,
  placeholder = translator('select'),
  searchable,
  value,
  variant = 'field',
}: PropsType) => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [translateY] = useState(() => new Animated.Value(0));

  const selected = options.find((option) => option.value === value);
  const keyword = search.trim().toLowerCase();
  const filteredOptions = keyword
    ? options.filter((option) => option.label.toLowerCase().includes(keyword))
    : options;

  const close = () => {
    setIsOpen(false);
    setSearch('');
  };

  const open = () => {
    translateY.setValue(0);
    setIsOpen(true);
  };

  const select = (option: OptionType) => {
    onChange(option.value);
    close();
  };

  useBackToClose(isOpen, close);

  const springBack = () =>
    Animated.spring(translateY, { bounciness: 4, toValue: 0, useNativeDriver }).start();

  const dragResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy > 4,
    onPanResponderMove: (_event, gesture) => translateY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy > closeDragDistance || gesture.vy > closeDragVelocity) {
        Animated.timing(translateY, { duration: 160, toValue: 800, useNativeDriver }).start(() =>
          close()
        );
      } else {
        springBack();
      }
    },
    onPanResponderTerminate: springBack,
    onStartShouldSetPanResponder: () => true,
  });

  const trigger =
    variant === 'chip' ? (
      <Pressable
        accessibilityRole="button"
        onPress={open}
        style={({ hovered }) => [styles.chip, hovered && styles.chipHovered]}
      >
        {icon && <MaterialIcons color={colors.primary} name={icon} size={16} />}
        <Text numberOfLines={1} style={styles.chipText}>
          {label ? `${label}: ` : ''}
          <Text style={styles.chipValue}>{selected?.label ?? placeholder}</Text>
        </Text>
        <MaterialIcons color={colors.primary} name="expand-more" size={18} />
      </Pressable>
    ) : (
      <View style={styles.container}>
        {label && <Text style={fieldStyles.label}>{label}</Text>}
        <Pressable
          accessibilityRole="button"
          onPress={open}
          style={[fieldStyles.box, isOpen && fieldStyles.focused]}
        >
          {icon && <MaterialIcons color={colors.textSubtle} name={icon} size={20} />}
          <Text numberOfLines={1} style={[styles.value, !selected && styles.placeholder]}>
            {selected?.label ?? placeholder}
          </Text>
          {clearable && selected ? (
            <Pressable
              accessibilityLabel={translator('clear')}
              hitSlop={8}
              onPress={() => onChange(null)}
            >
              <MaterialIcons color={colors.textSubtle} name="close" size={20} />
            </Pressable>
          ) : (
            <MaterialIcons color={colors.textSubtle} name="expand-more" size={24} />
          )}
        </Pressable>
      </View>
    );

  return (
    <>
      {trigger}
      <Modal animationType="fade" onRequestClose={close} transparent visible={isOpen}>
        <Pressable onPress={close} style={styles.backdrop}>
          <Animated.View style={[styles.sheetFrame, { transform: [{ translateY }] }]}>
            <Pressable style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}>
              <View {...dragResponder.panHandlers} style={styles.dragZone}>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
              </View>
              {searchable && (
                <ZTextField
                  autoFocus
                  icon="search"
                  onChangeText={setSearch}
                  placeholder={`${translator('search')}...`}
                  value={search}
                />
              )}
              <FlatList
                data={filteredOptions}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(option) => option.value}
                ListEmptyComponent={<Text style={styles.empty}>{translator('no_option')}</Text>}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <Pressable
                      onPress={() => select(item)}
                      style={({ hovered, pressed }) => [
                        styles.option,
                        (hovered || pressed) && styles.optionHovered,
                        isSelected && styles.optionSelected,
                      ]}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.label}
                      </Text>
                      {isSelected && (
                        <MaterialIcons color={colors.primary} name="check" size={20} />
                      )}
                    </Pressable>
                  );
                }}
                style={styles.list}
              />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  value: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
  },
  placeholder: {
    color: colors.textSubtle,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipHovered: {
    borderColor: colors.primaryTint,
  },
  chipText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 13,
  },
  chipValue: {
    color: colors.text,
    fontWeight: '600',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetFrame: {
    maxHeight: '75%',
    maxWidth: 560,
    width: '100%',
  },
  sheet: {
    ...shadows.lg,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    flexShrink: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  // The handle + title strip is the drag target, so the option list can
  // still scroll normally. On web, stop the browser from claiming the touch.
  dragZone: {
    gap: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...Platform.select<ViewStyle>({
      web: { cursor: 'grab', touchAction: 'none' } as unknown as ViewStyle,
      default: {},
    }),
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.borderStrong,
    borderRadius: radius.round,
    height: 5,
    width: 40,
  },
  sheetTitle: {
    ...typography.subtitle,
    color: colors.text,
    paddingHorizontal: spacing.xs,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  optionHovered: {
    backgroundColor: colors.surfaceMuted,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    padding: spacing.lg,
    textAlign: 'center',
  },
});

export default ZSelect;

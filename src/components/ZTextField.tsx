import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import ZIconButton from '@/components/ZIconButton';
import { colors, noOutline, radius, spacing, typography } from '@/constants/theme';
import translator from '@/lib/translator';

type PropsType = TextInputProps & {
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  label?: string;
  left?: ReactNode;
  right?: ReactNode;
};

const ZTextField = ({
  icon,
  label,
  left,
  onBlur,
  onFocus,
  right,
  secureTextEntry,
  style,
  ...inputProps
}: PropsType) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[fieldStyles.box, isFocused && fieldStyles.focused]}>
        {left}
        {icon && (
          <MaterialIcons
            color={isFocused ? colors.primary : colors.textSubtle}
            name={icon}
            size={20}
          />
        )}
        <TextInput
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          style={[styles.input, style]}
          {...inputProps}
        />
        {secureTextEntry && (
          <ZIconButton
            accessibilityLabel={translator(isSecureVisible ? 'hide_password' : 'show_password')}
            color={colors.textSubtle}
            name={isSecureVisible ? 'visibility-off' : 'visibility'}
            onPress={() => setIsSecureVisible((value) => !value)}
          />
        )}
        {right}
      </View>
    </View>
  );
};

export const fieldStyles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  focused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    boxShadow: `0 0 0 4px ${colors.primarySoft}`,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: fieldStyles.label,
  input: {
    ...noOutline,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minWidth: 0,
    paddingVertical: spacing.md,
  },
});

export default ZTextField;

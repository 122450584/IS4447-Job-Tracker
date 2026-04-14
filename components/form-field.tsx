import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export function FormField({
  label,
  error,
  helperText,
  accessibilityHint,
  accessibilityLabel,
  style,
  ...rest
}: FormFieldProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const message = error ?? helperText;

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityHint={accessibilityHint ?? message}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            color: colors.text,
          },
          style,
        ]}
        {...rest}
      />
      {message ? (
        <ThemedText
          lightColor={error ? Colors.light.danger : Colors.light.muted}
          darkColor={error ? Colors.dark.danger : Colors.dark.muted}
          style={styles.message}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});

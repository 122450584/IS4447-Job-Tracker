import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  accessibilityLabel,
  accessibilityState,
  style,
  ...rest
}: AppButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' ? Colors.dark.text : colors.text;
  const borderColor = variant === 'danger' ? colors.danger : colors.tint;
  const backgroundColor =
    variant === 'primary' ? colors.tint : variant === 'danger' ? 'transparent' : colors.surface;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor, opacity: isDisabled ? 0.55 : pressed ? 0.75 : 1 },
        style,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={textColor} /> : null}
      <ThemedText style={[styles.text, { color: variant === 'danger' ? colors.danger : textColor }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  text: {
    fontWeight: '700',
  },
});

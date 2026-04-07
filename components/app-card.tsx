import { PropsWithChildren } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from './themed-view';

type AppCardProps = PropsWithChildren<ViewProps>;

export function AppCard({ children, style, ...rest }: AppCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemedView
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.surface}
      style={[styles.card, { borderColor: colors.border }, style]}
      {...rest}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
});

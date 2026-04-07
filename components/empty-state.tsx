import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AppCard } from './app-card';
import { ThemedText } from './themed-text';

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <AppCard style={styles.card}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  message: {
    lineHeight: 23,
  },
});

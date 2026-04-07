import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { AppCard } from './app-card';
import { AppButton } from './app-button';
import { ThemedText } from './themed-text';

type ErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ErrorState({ title, message, actionLabel, onActionPress }: ErrorStateProps) {
  return (
    <AppCard style={styles.card}>
      <ThemedText type="subtitle" lightColor={Colors.light.danger} darkColor={Colors.dark.danger}>
        {title}
      </ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {actionLabel && onActionPress ? (
        <AppButton title={actionLabel} variant="secondary" onPress={onActionPress} />
      ) : null}
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

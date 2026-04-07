import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type AppScreenProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function AppScreen({ title, description, children }: AppScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{title}</ThemedText>
          {description ? <ThemedText style={styles.summary}>{description}</ThemedText> : null}
        </ThemedView>

        {children}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    gap: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  summary: {
    fontSize: 17,
    lineHeight: 25,
  },
});

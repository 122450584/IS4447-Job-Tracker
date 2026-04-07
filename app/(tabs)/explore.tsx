import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Insights</ThemedText>
        <ThemedText style={styles.summary}>
          Progress summaries will appear here after applications, categories, and targets are saved.
        </ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">This week</ThemedText>
        <ThemedText style={styles.cardText}>
          0 applications recorded. Weekly progress will be calculated from stored application
          records.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Category breakdown</ThemedText>
        <ThemedText style={styles.cardText}>
          No categories yet. Once categories exist, this view will show how applications are spread
          across role types.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Target progress</ThemedText>
        <ThemedText style={styles.cardText}>
          No target set. Future summaries will show progress, remaining applications, and whether a
          target has been exceeded.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  header: {
    gap: 12,
    paddingTop: 48,
    paddingBottom: 8,
  },
  summary: {
    fontSize: 17,
    lineHeight: 25,
  },
  card: {
    borderColor: '#D7DEE8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardText: {
    lineHeight: 23,
  },
});

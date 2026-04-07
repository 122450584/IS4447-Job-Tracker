import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Job Application Tracker</ThemedText>
        <ThemedText style={styles.summary}>
          Keep job applications, statuses, targets, and notes organised privately on this device.
        </ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">Applications</ThemedText>
        <ThemedText style={styles.cardText}>
          No applications have been added yet. Saved applications will show company, role, date,
          category, status, and notes.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Status history</ThemedText>
        <ThemedText style={styles.cardText}>
          Status updates such as applied, interviewing, offer, rejected, or withdrawn will be shown
          as a timeline for each application.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Targets</ThemedText>
        <ThemedText style={styles.cardText}>
          Weekly and monthly goals will help compare planned application volume with completed
          applications.
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

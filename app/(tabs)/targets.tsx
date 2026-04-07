import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export default function TargetsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Targets</ThemedText>
        <ThemedText style={styles.summary}>
          Set weekly or monthly goals for job application volume.
        </ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">No targets set</ThemedText>
        <ThemedText style={styles.cardText}>
          Targets show the goal amount, completed applications, remaining applications, and whether
          the goal has been met.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Global targets</ThemedText>
        <ThemedText style={styles.cardText}>
          Global targets count every saved application in the selected week or month.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Category targets</ThemedText>
        <ThemedText style={styles.cardText}>
          Category targets focus on specific role types such as graduate roles, internships, or
          remote positions.
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

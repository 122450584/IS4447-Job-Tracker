import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Application Details</ThemedText>
      <ThemedText style={styles.description}>
        Detailed application information and status history appear here.
      </ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to tracker</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});

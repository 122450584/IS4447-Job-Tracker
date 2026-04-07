import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText style={styles.summary}>
          Manage profile, app preferences, and local data options.
        </ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">Profile</ThemedText>
        <ThemedText style={styles.cardText}>
          No local profile is active on this device.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Privacy</ThemedText>
        <ThemedText style={styles.cardText}>
          Job application data stays local on this device by default.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Appearance</ThemedText>
        <ThemedText style={styles.cardText}>
          The app follows the device appearance setting.
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

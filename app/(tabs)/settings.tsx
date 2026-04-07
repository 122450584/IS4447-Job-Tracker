import { AppCard } from '@/components/app-card';
import { AppScreen } from '@/components/app-screen';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';

export default function SettingsScreen() {
  return (
    <AppScreen title="Settings" description="Manage profile, app preferences, and local data options.">
      <EmptyState title="No local profile" message="No local profile is active on this device." />

      <AppCard>
        <ThemedText type="subtitle">Privacy</ThemedText>
        <ThemedText>
          Job application data stays local on this device by default.
        </ThemedText>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Appearance</ThemedText>
        <ThemedText>The app follows the device appearance setting.</ThemedText>
      </AppCard>
    </AppScreen>
  );
}

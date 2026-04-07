import { AppCard } from '@/components/app-card';
import { AppScreen } from '@/components/app-screen';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  return (
    <AppScreen
      title="Applications"
      description="Keep job applications, statuses, targets, and notes organised privately on this device.">
      <EmptyState
        title="No applications yet"
        message="No applications have been added yet. Saved applications show company, role, date, category, status, and notes."
      />

      <AppCard>
        <ThemedText type="subtitle">Status history</ThemedText>
        <ThemedText>
          Status updates such as applied, interviewing, offer, rejected, or withdrawn are shown as a
          timeline for each application.
        </ThemedText>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Targets</ThemedText>
        <ThemedText>
          Weekly and monthly goals compare target application volume with completed applications.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

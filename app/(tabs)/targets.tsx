import { AppCard } from '@/components/app-card';
import { AppScreen } from '@/components/app-screen';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';

export default function TargetsScreen() {
  return (
    <AppScreen title="Targets" description="Set weekly or monthly goals for job application volume.">
      <EmptyState
        title="No targets set"
        message="Targets show the goal amount, completed applications, remaining applications, and whether the goal has been met."
      />

      <AppCard>
        <ThemedText type="subtitle">Global targets</ThemedText>
        <ThemedText>
          Global targets count every saved application in the selected week or month.
        </ThemedText>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Category targets</ThemedText>
        <ThemedText>
          Category targets focus on specific role types such as graduate roles, internships, or
          remote positions.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

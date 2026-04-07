import { AppCard } from '@/components/app-card';
import { AppScreen } from '@/components/app-screen';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';

export default function TabTwoScreen() {
  return (
    <AppScreen
      title="Insights"
      description="Save applications, categories, and targets to see progress summaries here.">
      <EmptyState
        title="No insight data"
        message="Insights are calculated from stored applications once records are available."
      />

      <AppCard>
        <ThemedText type="subtitle">This week</ThemedText>
        <ThemedText>
          0 applications recorded. Weekly progress is calculated from stored application records.
        </ThemedText>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Category breakdown</ThemedText>
        <ThemedText>
          No categories yet. Category summaries show how applications are spread across role types.
        </ThemedText>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Target progress</ThemedText>
        <ThemedText>
          No target set. Target summaries show progress, remaining applications, and exceeded goals.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

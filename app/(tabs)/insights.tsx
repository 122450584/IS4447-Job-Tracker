import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppScreen } from '@/components/app-screen';
import { AppCard } from '@/components/app-card';
import { InsightsDashboard } from '@/components/insights-dashboard';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { type InsightPeriod } from '@/services/insight-service';

export default function TabTwoScreen() {
  const [period, setPeriod] = useState<InsightPeriod>('weekly');
  const { reloadUser, user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      reloadUser();
    }, [reloadUser])
  );

  if (user) {
    return (
      <AppScreen
        title="Insights"
        description="Review progress from your stored job applications.">
        <InsightsDashboard period={period} userId={user.id} onPeriodChange={setPeriod} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Insights"
      description="Review progress from your stored job applications.">
      <AppCard>
        <ThemedText type="subtitle">Sign in to view insights</ThemedText>
        <ThemedText>
          Create a local profile in Settings to calculate charts from stored applications.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

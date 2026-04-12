import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { AppScreen } from '@/components/app-screen';
import { AppCard } from '@/components/app-card';
import { TargetManager } from '@/components/target-manager';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function TargetsScreen() {
  const { reloadUser, user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      reloadUser();
    }, [reloadUser])
  );

  if (user) {
    return (
      <AppScreen title="Targets" description="Set weekly or monthly goals for job application volume.">
        <TargetManager userId={user.id} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Targets" description="Set weekly or monthly goals for job application volume.">
      <AppCard>
        <ThemedText type="subtitle">Sign in to manage targets</ThemedText>
        <ThemedText>
          Create a local profile in Settings before setting weekly or monthly application goals.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

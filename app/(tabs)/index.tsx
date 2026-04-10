import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { AppCard } from '@/components/app-card';
import { AppScreen } from '@/components/app-screen';
import { ApplicationManager } from '@/components/application-manager';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { reloadUser, user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      reloadUser();
    }, [reloadUser])
  );

  if (user) {
    return (
      <AppScreen
        title="Applications"
        description="Track your job applications in one place.">
        <ApplicationManager userId={user.id} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Applications"
      description="Track your job applications in one place.">
      <AppCard>
        <ThemedText type="subtitle">Sign in to get started</ThemedText>
        <ThemedText>
          Create a local profile in Settings to start recording job applications.
        </ThemedText>
      </AppCard>
    </AppScreen>
  );
}

import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppButton } from '@/components/app-button';
import { AppScreen } from '@/components/app-screen';
import { CategoryManager } from '@/components/category-manager';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

type AuthMode = 'login' | 'register';

export default function SettingsScreen() {
  const { error, isLoading, login, logout, register, removeProfile, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isRegistering = mode === 'register';

  async function handleSubmit() {
    try {
      if (isRegistering) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      setPassword('');
    } catch {
      // error is captured in the hook's error state
    }
  }

  function handleDeleteProfile() {
    Alert.alert(
      'Delete profile',
      'This removes the local profile and related data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: removeProfile,
        },
      ]
    );
  }

  if (user) {
    return (
      <AppScreen title="Settings" description="Manage profile, app preferences, and local data options.">
        <AppCard>
          <ThemedText type="subtitle">Signed in</ThemedText>
          <ThemedText>{user.name}</ThemedText>
          <ThemedText>{user.email}</ThemedText>
        </AppCard>

        <AppCard>
          <ThemedText type="subtitle">Privacy</ThemedText>
          <ThemedText>Job application data stays local on this device by default.</ThemedText>
        </AppCard>

        <CategoryManager userId={user.id} />

        <View style={styles.actions}>
          <AppButton title="Log out" variant="secondary" onPress={logout} />
          <AppButton title="Delete profile" variant="danger" onPress={handleDeleteProfile} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Settings" description="Manage profile, app preferences, and local data options.">
      <AppCard>
        <ThemedText type="subtitle">{isRegistering ? 'Create local profile' : 'Log in'}</ThemedText>
        <ThemedText>
          {isRegistering
            ? 'Create a local profile to keep application records separate.'
            : 'Use an existing local profile on this device.'}
        </ThemedText>

        <View style={styles.form}>
          {isRegistering ? (
            <FormField
              autoCapitalize="words"
              label="Name"
              onChangeText={setName}
              placeholder="Enter your name"
              value={name}
            />
          ) : null}

          <FormField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="Enter your email"
            value={email}
          />

          <FormField
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
          />
        </View>

        {error ? (
          <ThemedText lightColor={Colors.light.danger} darkColor={Colors.dark.danger}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            loading={isLoading}
            onPress={handleSubmit}
            title={isRegistering ? 'Create profile' : 'Log in'}
          />
          <AppButton
            disabled={isLoading}
            onPress={() => setMode(isRegistering ? 'login' : 'register')}
            title={isRegistering ? 'Use existing profile' : 'Create profile'}
            variant="secondary"
          />
        </View>
      </AppCard>

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

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});

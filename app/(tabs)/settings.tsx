import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { AppButton } from '@/components/app-button';
import { AppScreen } from '@/components/app-screen';
import { CategoryManager } from '@/components/category-manager';
import { DailyReminderSettings } from '@/components/daily-reminder-settings';
import { ErrorMessage } from '@/components/error-message';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { type ThemePreference } from '@/db/schema';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCsvExport } from '@/hooks/use-csv-export';
import { useThemePreference } from '@/hooks/use-theme-preference';
import { cancelDailyApplicationReminder } from '@/services/notification-service';
import { getDailyReminderSettings } from '@/services/settings-service';

type AuthMode = 'login' | 'register';

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const { error, isLoading, login, logout, register, removeProfile, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    changePreference,
    error: themeError,
    preference: themePreference,
  } = useThemePreference(user?.id);
  const {
    error: exportError,
    exportCsv,
    isExporting,
    lastExport,
  } = useCsvExport(user?.id);
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
    const message = 'This removes the local profile and related data from this device.';

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        void handleConfirmedDeleteProfile();
      }
      return;
    }

    Alert.alert(
      'Delete profile',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleConfirmedDeleteProfile();
          },
        },
      ]
    );
  }

  async function handleConfirmedDeleteProfile() {
    if (!user) {
      return;
    }

    try {
      const reminderSettings = getDailyReminderSettings(user.id);
      await cancelDailyApplicationReminder(reminderSettings.notificationId);
    } finally {
      removeProfile();
    }
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

        <AppCard>
          <ThemedText type="subtitle">Data export</ThemedText>
          <ThemedText>
            Download your stored job applications as a CSV file for your own records.
          </ThemedText>
          <AppButton
            loading={isExporting}
            onPress={exportCsv}
            title="Export CSV"
            variant="secondary"
          />
          {lastExport ? (
            <ThemedText>
              Exported {lastExport.recordCount} applications to {lastExport.fileName}.
            </ThemedText>
          ) : null}
          {exportError ? <ErrorMessage message={exportError} /> : null}
        </AppCard>

        <DailyReminderSettings userId={user.id} />

        <AppCard>
          <ThemedText type="subtitle">Appearance</ThemedText>
          <View style={styles.optionRow}>
            {themeOptions.map((option) => {
              const selected = option.value === themePreference;

              return (
                <Pressable
                  accessibilityLabel={`Use ${option.label.toLowerCase()} appearance`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => changePreference(option.value)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selected ? colors.tint : colors.surface,
                      borderColor: selected ? colors.tint : colors.border,
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.optionText,
                      { color: selected ? Colors.dark.text : colors.text },
                    ]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          {themeError ? <ErrorMessage message={themeError} /> : null}
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

        {error ? <ErrorMessage message={error} /> : null}

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
  optionButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

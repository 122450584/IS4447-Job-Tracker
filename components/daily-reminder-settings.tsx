import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { ErrorMessage } from '@/components/error-message';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDailyReminder } from '@/hooks/use-daily-reminder';
import { isReminderTime } from '@/services/reminder-time';

type DailyReminderSettingsProps = {
  userId: number;
};

export function DailyReminderSettings({ userId }: DailyReminderSettingsProps) {
  const {
    availability,
    disableReminder,
    enableReminder,
    error,
    isSaving,
    settings,
  } = useDailyReminder(userId);
  const [time, setTime] = useState(settings.time);
  const timeError = time && !isReminderTime(time) ? 'Use HH:mm, for example 09:00.' : undefined;

  useEffect(() => {
    setTime(settings.time);
  }, [settings.time]);

  return (
    <AppCard>
      <ThemedText type="subtitle">Daily reminder</ThemedText>
      <ThemedText>
        {settings.enabled
          ? `Reminder set for ${settings.time}.`
          : 'Set a daily prompt to log or review job applications.'}
      </ThemedText>

      {availability.message ? <ThemedText>{availability.message}</ThemedText> : null}

      <FormField
        accessibilityHint="Enter a time using 24 hour format."
        editable={availability.supported}
        error={timeError}
        keyboardType="numbers-and-punctuation"
        label="Reminder time"
        onChangeText={setTime}
        placeholder="09:00"
        value={time}
      />

      {error ? <ErrorMessage message={error} /> : null}

      <View style={styles.actions}>
        <AppButton
          disabled={!availability.supported || !!timeError}
          loading={isSaving}
          onPress={() => enableReminder(time)}
          title={settings.enabled ? 'Save reminder time' : 'Turn on reminder'}
        />
        {settings.enabled ? (
          <AppButton
            disabled={isSaving}
            onPress={disableReminder}
            title="Turn off reminder"
            variant="secondary"
          />
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
  },
});

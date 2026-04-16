import { useCallback, useEffect, useState } from 'react';

import {
  type DailyReminderSettings,
  getDailyReminderSettings,
  updateDailyReminderSettings,
} from '@/services/settings-service';
import {
  cancelDailyApplicationReminder,
  getNotificationAvailability,
  scheduleDailyApplicationReminder,
} from '@/services/notification-service';
import { isReminderTime } from '@/services/reminder-time';

const defaultReminderSettings: DailyReminderSettings = {
  enabled: false,
  time: '09:00',
  notificationId: null,
};

export function useDailyReminder(userId: number | null | undefined) {
  const [settings, setSettings] = useState<DailyReminderSettings>(defaultReminderSettings);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const availability = getNotificationAvailability();

  const reloadReminder = useCallback(() => {
    if (!userId) {
      setSettings(defaultReminderSettings);
      setError(null);
      return;
    }

    try {
      setSettings(getDailyReminderSettings(userId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reminder settings could not be loaded.');
    }
  }, [userId]);

  useEffect(() => {
    reloadReminder();
  }, [reloadReminder]);

  const enableReminder = useCallback(
    async (time: string) => {
      if (!userId) {
        return;
      }

      if (!availability.supported) {
        setError(availability.message ?? 'Daily reminders are not available on this device.');
        return;
      }

      if (!isReminderTime(time)) {
        setError('Use a valid reminder time in HH:mm format.');
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const notificationId = await scheduleDailyApplicationReminder(time, settings.notificationId);
        const nextSettings = updateDailyReminderSettings(userId, {
          enabled: true,
          time,
          notificationId,
        });

        setSettings(nextSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Daily reminder could not be scheduled.');
      } finally {
        setIsSaving(false);
      }
    },
    [availability.message, availability.supported, settings.notificationId, userId]
  );

  const disableReminder = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await cancelDailyApplicationReminder(settings.notificationId);
      const nextSettings = updateDailyReminderSettings(userId, {
        enabled: false,
        time: settings.time,
        notificationId: null,
      });

      setSettings(nextSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Daily reminder could not be cancelled.');
    } finally {
      setIsSaving(false);
    }
  }, [settings.notificationId, settings.time, userId]);

  return {
    availability,
    disableReminder,
    enableReminder,
    error,
    isSaving,
    reloadReminder,
    settings,
  };
}

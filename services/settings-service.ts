import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import { settings, type ThemePreference, themePreferences } from '@/db/schema';
import { isReminderTime } from '@/services/reminder-time';
import { setStoredThemePreference } from '@/services/theme-preference-store';

export type DailyReminderSettings = {
  enabled: boolean;
  time: string;
  notificationId: string | null;
};

type SettingsRow = {
  daily_reminder_enabled: number;
  daily_reminder_time: string;
  daily_reminder_notification_id: string | null;
};

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

function toDailyReminderSettings(row: SettingsRow): DailyReminderSettings {
  return {
    enabled: row.daily_reminder_enabled === 1,
    time: isReminderTime(row.daily_reminder_time) ? row.daily_reminder_time : '09:00',
    notificationId: row.daily_reminder_notification_id,
  };
}

function ensureSettings(userId: number) {
  const existing = db
    .select({
      id: settings.id,
      theme_preference: settings.theme_preference,
      daily_reminder_enabled: settings.daily_reminder_enabled,
      daily_reminder_time: settings.daily_reminder_time,
      daily_reminder_notification_id: settings.daily_reminder_notification_id,
    })
    .from(settings)
    .where(eq(settings.user_id, userId))
    .get();

  if (existing) {
    return existing;
  }

  return db
    .insert(settings)
    .values({
      user_id: userId,
      theme_preference: 'system',
      daily_reminder_enabled: 0,
      daily_reminder_time: '09:00',
      daily_reminder_notification_id: null,
    })
    .returning({
      id: settings.id,
      theme_preference: settings.theme_preference,
      daily_reminder_enabled: settings.daily_reminder_enabled,
      daily_reminder_time: settings.daily_reminder_time,
      daily_reminder_notification_id: settings.daily_reminder_notification_id,
    })
    .get();
}

export function getThemePreference(userId: number): ThemePreference {
  initializeDatabase();

  const row = ensureSettings(userId);

  setStoredThemePreference(row.theme_preference);

  return row.theme_preference;
}

export function updateThemePreference(userId: number, preference: ThemePreference) {
  initializeDatabase();

  if (!isThemePreference(preference)) {
    throw new Error('Choose a valid theme preference.');
  }

  ensureSettings(userId);

  db.update(settings)
    .set({ theme_preference: preference })
    .where(eq(settings.user_id, userId))
    .run();

  setStoredThemePreference(preference);

  return preference;
}

export function getDailyReminderSettings(userId: number): DailyReminderSettings {
  initializeDatabase();

  return toDailyReminderSettings(ensureSettings(userId));
}

export function updateDailyReminderSettings(
  userId: number,
  nextSettings: DailyReminderSettings
): DailyReminderSettings {
  initializeDatabase();

  if (!isReminderTime(nextSettings.time)) {
    throw new Error('Use a valid reminder time in HH:mm format.');
  }

  ensureSettings(userId);

  db.update(settings)
    .set({
      daily_reminder_enabled: nextSettings.enabled ? 1 : 0,
      daily_reminder_time: nextSettings.time,
      daily_reminder_notification_id: nextSettings.notificationId,
    })
    .where(eq(settings.user_id, userId))
    .run();

  return nextSettings;
}

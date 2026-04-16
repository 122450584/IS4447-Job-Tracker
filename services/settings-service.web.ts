import { type Settings, type ThemePreference, themePreferences } from '@/db/schema';
import { isReminderTime } from '@/services/reminder-time';
import { setStoredThemePreference } from '@/services/theme-preference-store';

type StoredSettings = Omit<Settings, 'id'>;

export type DailyReminderSettings = {
  enabled: boolean;
  time: string;
  notificationId: string | null;
};

const settingsStorageKey = 'job_tracker_settings';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

function normalizeSettings(setting: Partial<StoredSettings> & { user_id: number }): StoredSettings {
  const themePreference = setting.theme_preference;
  const reminderTime = setting.daily_reminder_time;

  return {
    user_id: setting.user_id,
    theme_preference: themePreference && isThemePreference(themePreference) ? themePreference : 'system',
    daily_reminder_enabled: setting.daily_reminder_enabled === 1 ? 1 : 0,
    daily_reminder_time: reminderTime && isReminderTime(reminderTime) ? reminderTime : '09:00',
    daily_reminder_notification_id: setting.daily_reminder_notification_id ?? null,
  };
}

function toDailyReminderSettings(setting: StoredSettings): DailyReminderSettings {
  return {
    enabled: setting.daily_reminder_enabled === 1,
    time: setting.daily_reminder_time,
    notificationId: setting.daily_reminder_notification_id,
  };
}

function readSettings(): StoredSettings[] {
  if (!canUseStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(settingsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as Array<Partial<StoredSettings> & { user_id: number }>;

    return parsed.map(normalizeSettings);
  } catch {
    return [];
  }
}

function writeSettings(nextSettings: StoredSettings[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(nextSettings));
  }
}

export function getThemePreference(userId: number): ThemePreference {
  const existing = readSettings().find((setting) => setting.user_id === userId);
  const preference = existing?.theme_preference ?? 'system';

  setStoredThemePreference(preference);

  if (!existing) {
    writeSettings([...readSettings(), normalizeSettings({ user_id: userId, theme_preference: preference })]);
  }

  return preference;
}

export function updateThemePreference(userId: number, preference: ThemePreference) {
  if (!isThemePreference(preference)) {
    throw new Error('Choose a valid theme preference.');
  }

  const storedSettings = readSettings();
  const existing = storedSettings.some((setting) => setting.user_id === userId);

  writeSettings(
    existing
      ? storedSettings.map((setting) =>
          setting.user_id === userId ? { ...setting, theme_preference: preference } : setting
        )
      : [...storedSettings, normalizeSettings({ user_id: userId, theme_preference: preference })]
  );
  setStoredThemePreference(preference);

  return preference;
}

export function getDailyReminderSettings(userId: number): DailyReminderSettings {
  const storedSettings = readSettings();
  const existing = storedSettings.find((setting) => setting.user_id === userId);

  if (existing) {
    return toDailyReminderSettings(existing);
  }

  const nextSettings = normalizeSettings({ user_id: userId });

  writeSettings([...storedSettings, nextSettings]);

  return toDailyReminderSettings(nextSettings);
}

export function updateDailyReminderSettings(
  userId: number,
  nextReminderSettings: DailyReminderSettings
): DailyReminderSettings {
  if (!isReminderTime(nextReminderSettings.time)) {
    throw new Error('Use a valid reminder time in HH:mm format.');
  }

  const storedSettings = readSettings();
  const existing = storedSettings.some((setting) => setting.user_id === userId);
  const nextStoredSettings = {
    daily_reminder_enabled: nextReminderSettings.enabled ? 1 : 0,
    daily_reminder_time: nextReminderSettings.time,
    daily_reminder_notification_id: nextReminderSettings.notificationId,
  };

  writeSettings(
    existing
      ? storedSettings.map((setting) =>
          setting.user_id === userId ? { ...setting, ...nextStoredSettings } : setting
        )
      : [...storedSettings, normalizeSettings({ user_id: userId, ...nextStoredSettings })]
  );

  return nextReminderSettings;
}

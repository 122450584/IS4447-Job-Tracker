import { type Settings, type ThemePreference, themePreferences } from '@/db/schema';
import { setStoredThemePreference } from '@/services/theme-preference-store';

type StoredSettings = Omit<Settings, 'id'>;

const settingsStorageKey = 'job_tracker_settings';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
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
    return JSON.parse(stored) as StoredSettings[];
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
    writeSettings([...readSettings(), { user_id: userId, theme_preference: preference }]);
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
      : [...storedSettings, { user_id: userId, theme_preference: preference }]
  );
  setStoredThemePreference(preference);

  return preference;
}

import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import { settings, type ThemePreference, themePreferences } from '@/db/schema';
import { setStoredThemePreference } from '@/services/theme-preference-store';

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

export function getThemePreference(userId: number): ThemePreference {
  initializeDatabase();

  const row = db
    .select({ theme_preference: settings.theme_preference })
    .from(settings)
    .where(eq(settings.user_id, userId))
    .get();

  if (row) {
    setStoredThemePreference(row.theme_preference);
    return row.theme_preference;
  }

  db.insert(settings)
    .values({
      user_id: userId,
      theme_preference: 'system',
    })
    .run();

  setStoredThemePreference('system');

  return 'system';
}

export function updateThemePreference(userId: number, preference: ThemePreference) {
  initializeDatabase();

  if (!isThemePreference(preference)) {
    throw new Error('Choose a valid theme preference.');
  }

  const existing = db
    .select({ id: settings.id })
    .from(settings)
    .where(eq(settings.user_id, userId))
    .get();

  if (existing) {
    db.update(settings)
      .set({ theme_preference: preference })
      .where(eq(settings.user_id, userId))
      .run();
  } else {
    db.insert(settings)
      .values({
        user_id: userId,
        theme_preference: preference,
      })
      .run();
  }

  setStoredThemePreference(preference);

  return preference;
}

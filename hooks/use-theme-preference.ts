import { useCallback, useEffect, useState } from 'react';

import { type ThemePreference } from '@/db/schema';
import { getThemePreference, updateThemePreference } from '@/services/settings-service';
import { setStoredThemePreference } from '@/services/theme-preference-store';

export function useThemePreference(userId: number | null | undefined) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [error, setError] = useState<string | null>(null);

  const reloadPreference = useCallback(() => {
    if (!userId) {
      setPreference('system');
      setStoredThemePreference('system');
      return;
    }

    setError(null);

    try {
      setPreference(getThemePreference(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Theme preference could not be loaded.');
    }
  }, [userId]);

  useEffect(() => {
    reloadPreference();
  }, [reloadPreference]);

  const changePreference = useCallback(
    (nextPreference: ThemePreference) => {
      if (!userId) {
        return;
      }

      setError(null);

      try {
        setPreference(updateThemePreference(userId, nextPreference));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Theme preference could not be saved.');
      }
    },
    [userId]
  );

  return {
    changePreference,
    error,
    preference,
    reloadPreference,
  };
}

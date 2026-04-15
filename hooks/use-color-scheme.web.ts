import { useEffect, useState, useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import {
  getActiveColorScheme,
  getStoredThemePreference,
  subscribeThemePreference,
} from '@/services/theme-preference-store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getStoredThemePreference,
    getStoredThemePreference
  );

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return getActiveColorScheme(colorScheme);
  }

  return preference === 'dark' ? 'dark' : 'light';
}

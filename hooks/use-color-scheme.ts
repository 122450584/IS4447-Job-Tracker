import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import {
  getActiveColorScheme,
  getStoredThemePreference,
  subscribeThemePreference,
} from '@/services/theme-preference-store';

export function useColorScheme() {
  const systemScheme = useRNColorScheme();

  useSyncExternalStore(
    subscribeThemePreference,
    getStoredThemePreference,
    getStoredThemePreference
  );

  return getActiveColorScheme(systemScheme);
}

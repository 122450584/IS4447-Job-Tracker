import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import {
  getStoredThemePreference,
  subscribeThemePreference,
} from '@/services/theme-preference-store';

export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getStoredThemePreference,
    getStoredThemePreference
  );

  if (preference === 'system') {
    return systemScheme ?? 'light';
  }

  return preference;
}

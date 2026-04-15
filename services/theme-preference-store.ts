import { type ColorSchemeName } from 'react-native';

import { type ThemePreference } from '@/db/schema';

let currentPreference: ThemePreference = 'system';
const listeners = new Set<() => void>();

export function getActiveColorScheme(systemScheme: ColorSchemeName) {
  if (currentPreference === 'system') {
    return systemScheme ?? 'light';
  }

  return currentPreference;
}

export function getStoredThemePreference() {
  return currentPreference;
}

export function setStoredThemePreference(preference: ThemePreference) {
  currentPreference = preference;
  listeners.forEach((listener) => listener());
}

export function subscribeThemePreference(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

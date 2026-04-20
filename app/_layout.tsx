import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemePreference } from '@/hooks/use-theme-preference';
import { initializeSeedData } from '@/services/seed-service';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const palette = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    initializeSeedData();
  }, []);

  useThemePreference(user?.id);

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: palette.background,
                card: palette.surface,
                border: palette.border,
                notification: palette.danger,
                primary: palette.tint,
                text: palette.text,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: palette.background,
                card: palette.surface,
                border: palette.border,
                notification: palette.danger,
                primary: palette.tint,
                text: palette.text,
              },
            }
      }>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

import { Platform } from 'react-native';
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';
import setNotificationChannelAsync from 'expo-notifications/build/setNotificationChannelAsync';

import { parseReminderTime } from '@/services/reminder-time';

const dailyReminderChannelId = 'daily-application-reminders';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type NotificationAvailability = {
  supported: boolean;
  message?: string;
};

export function getNotificationAvailability(): NotificationAvailability {
  return {
    supported: Platform.OS !== 'web',
  };
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await setNotificationChannelAsync(dailyReminderChannelId, {
    name: 'Daily reminders',
    importance: AndroidImportance.DEFAULT,
  });
}

async function ensureNotificationPermission() {
  const existingPermission = await getPermissionsAsync();

  if (existingPermission.granted) {
    return;
  }

  const requestedPermission = await requestPermissionsAsync();

  if (!requestedPermission.granted) {
    throw new Error('Notification permission was not granted.');
  }
}

export async function scheduleDailyApplicationReminder(
  time: string,
  existingNotificationId?: string | null
) {
  const parsedTime = parseReminderTime(time);

  if (!parsedTime) {
    throw new Error('Use a valid reminder time in HH:mm format.');
  }

  if (existingNotificationId) {
    await cancelScheduledNotificationAsync(existingNotificationId);
  }

  await ensureNotificationPermission();
  await ensureAndroidChannel();

  return scheduleNotificationAsync({
    content: {
      title: 'Job application reminder',
      body: 'Take a few minutes to log or review your job applications today.',
      data: { screen: 'applications' },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
      channelId: Platform.OS === 'android' ? dailyReminderChannelId : undefined,
    },
  });
}

export async function cancelDailyApplicationReminder(notificationId?: string | null) {
  if (notificationId) {
    await cancelScheduledNotificationAsync(notificationId);
  }
}

export type NotificationAvailability = {
  supported: boolean;
  message?: string;
};

export function getNotificationAvailability(): NotificationAvailability {
  return {
    supported: false,
    message: 'Daily reminders are available on Android and iOS devices.',
  };
}

export async function scheduleDailyApplicationReminder() {
  throw new Error('Daily reminders are available on Android and iOS devices.');
}

export async function cancelDailyApplicationReminder() {
  return;
}

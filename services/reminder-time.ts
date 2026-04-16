export type ReminderTimeParts = {
  hour: number;
  minute: number;
};

const reminderTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseReminderTime(time: string): ReminderTimeParts | null {
  const match = reminderTimePattern.exec(time.trim());

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function formatReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function isReminderTime(time: string) {
  return parseReminderTime(time) !== null;
}

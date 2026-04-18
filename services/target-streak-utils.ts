import { type PeriodType, type Target } from '@/db/schema';

type StreakPeriod = Extract<PeriodType, 'weekly' | 'monthly'>;

type ProgressForStreak = {
  target: Target;
  state: 'exceeded' | 'met' | 'unmet';
};

export type TargetStreak = {
  currentStreak: number;
  lastCompletedPeriod: string | null;
  metPeriods: number;
  trackedPeriods: number;
};

export type TargetStreakSummary = Record<StreakPeriod, TargetStreak>;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function buildPeriodStreak(rows: ProgressForStreak[], periodType: StreakPeriod): TargetStreak {
  const today = todayString();
  const completedRows = rows.filter((row) => {
    if (row.target.period_type !== periodType) {
      return false;
    }

    const isCompletedPeriod = row.target.end_date <= today;
    const isActiveMetPeriod =
      row.target.start_date <= today && row.target.end_date >= today && row.state !== 'unmet';

    return isCompletedPeriod || isActiveMetPeriod;
  });
  const groupedPeriods = new Map<string, ProgressForStreak[]>();

  completedRows.forEach((row) => {
    const key = `${row.target.start_date}|${row.target.end_date}`;
    const currentRows = groupedPeriods.get(key) ?? [];

    groupedPeriods.set(key, [...currentRows, row]);
  });

  const periodResults = Array.from(groupedPeriods.entries())
    .map(([key, periodRows]) => {
      const [startDate, endDate] = key.split('|');

      return {
        endDate,
        label: `${startDate} to ${endDate}`,
        met: periodRows.every((row) => row.state !== 'unmet'),
        startDate,
      };
    })
    .sort((firstPeriod, secondPeriod) => {
      const endDateOrder = secondPeriod.endDate.localeCompare(firstPeriod.endDate);

      return endDateOrder || secondPeriod.startDate.localeCompare(firstPeriod.startDate);
    });

  let currentStreak = 0;

  for (const period of periodResults) {
    if (!period.met) {
      break;
    }

    currentStreak += 1;
  }

  return {
    currentStreak,
    lastCompletedPeriod: periodResults[0]?.label ?? null,
    metPeriods: periodResults.filter((period) => period.met).length,
    trackedPeriods: periodResults.length,
  };
}

export function buildTargetStreakSummary(rows: ProgressForStreak[]): TargetStreakSummary {
  return {
    weekly: buildPeriodStreak(rows, 'weekly'),
    monthly: buildPeriodStreak(rows, 'monthly'),
  };
}

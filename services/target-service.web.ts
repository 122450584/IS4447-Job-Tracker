import { type Application, type PeriodType, type Target } from '@/db/schema';

export type TargetInput = {
  userId: number;
  categoryId: number | null;
  periodType: Extract<PeriodType, 'weekly' | 'monthly'>;
  targetValue: number;
  startDate: string;
  endDate: string;
};

export type UpdateTargetInput = TargetInput & {
  id: number;
};

export type TargetProgress = {
  target: Target;
  completed: number;
  remaining: number;
  progressRatio: number;
  state: 'exceeded' | 'met' | 'unmet';
};

type StoredTarget = Omit<Target, 'created_at' | 'updated_at'> & {
  created_at: string;
  updated_at: string;
};

type StoredApplication = Omit<Application, 'created_at' | 'updated_at'> & {
  created_at: string;
  updated_at: string;
};

const targetsStorageKey = 'job_tracker_targets';
const applicationsStorageKey = 'job_tracker_applications';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function toTarget(target: StoredTarget): Target {
  return {
    ...target,
    created_at: new Date(target.created_at),
    updated_at: new Date(target.updated_at),
  };
}

function toStoredTarget(target: Target): StoredTarget {
  return {
    ...target,
    created_at: target.created_at.toISOString(),
    updated_at: target.updated_at.toISOString(),
  };
}

function readTargets(): Target[] {
  if (!canUseStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(targetsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return (JSON.parse(stored) as StoredTarget[]).map(toTarget);
  } catch {
    return [];
  }
}

function writeTargets(targetRows: Target[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(targetsStorageKey, JSON.stringify(targetRows.map(toStoredTarget)));
  }
}

function readApplications(): Application[] {
  if (!canUseStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(applicationsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return (JSON.parse(stored) as StoredApplication[]).map((application) => ({
      ...application,
      created_at: new Date(application.created_at),
      updated_at: new Date(application.updated_at),
    }));
  } catch {
    return [];
  }
}

function cleanTargetInput(input: TargetInput) {
  const startDate = input.startDate.trim();
  const endDate = input.endDate.trim();
  const targetValue = Number(input.targetValue);

  if (!['weekly', 'monthly'].includes(input.periodType)) {
    throw new Error('Choose a weekly or monthly target.');
  }

  if (!Number.isInteger(targetValue) || targetValue <= 0) {
    throw new Error('Target value must be a positive whole number.');
  }

  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error('Enter a valid start date in YYYY-MM-DD format.');
  }

  if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error('Enter a valid end date in YYYY-MM-DD format.');
  }

  if (endDate < startDate) {
    throw new Error('End date must be after start date.');
  }

  return {
    userId: input.userId,
    categoryId: input.categoryId,
    periodType: input.periodType,
    targetValue,
    startDate,
    endDate,
  };
}

function calculateProgress(target: Target): TargetProgress {
  const completed = readApplications()
    .filter((application) => {
      const matchesUser = application.user_id === target.user_id;
      const matchesDate =
        application.applied_date >= target.start_date && application.applied_date <= target.end_date;
      const matchesCategory =
        target.category_id === null || application.category_id === target.category_id;

      return matchesUser && matchesDate && matchesCategory;
    })
    .reduce((total, application) => total + application.metric_value, 0);
  const remaining = Math.max(target.target_value - completed, 0);
  const progressRatio = Math.min(completed / target.target_value, 1);
  const state = completed > target.target_value ? 'exceeded' : completed === target.target_value ? 'met' : 'unmet';

  return {
    target,
    completed,
    remaining,
    progressRatio,
    state,
  };
}

export function listTargetProgress(userId: number): TargetProgress[] {
  return readTargets()
    .filter((target) => target.user_id === userId)
    .sort((firstTarget, secondTarget) => secondTarget.start_date.localeCompare(firstTarget.start_date))
    .map(calculateProgress);
}

export function createTarget(input: TargetInput): TargetProgress {
  const values = cleanTargetInput(input);
  const now = new Date();
  const target: Target = {
    id: Date.now(),
    user_id: values.userId,
    category_id: values.categoryId,
    period_type: values.periodType,
    target_value: values.targetValue,
    start_date: values.startDate,
    end_date: values.endDate,
    created_at: now,
    updated_at: now,
  };

  writeTargets([...readTargets(), target]);

  return calculateProgress(target);
}

export function updateTarget(input: UpdateTargetInput): TargetProgress {
  const values = cleanTargetInput(input);
  const targetRows = readTargets();
  const existing = targetRows.find((target) => target.id === input.id && target.user_id === values.userId);

  if (!existing) {
    throw new Error('Target was not found.');
  }

  const updated: Target = {
    ...existing,
    category_id: values.categoryId,
    period_type: values.periodType,
    target_value: values.targetValue,
    start_date: values.startDate,
    end_date: values.endDate,
    updated_at: new Date(),
  };

  writeTargets(targetRows.map((target) => (target.id === updated.id ? updated : target)));

  return calculateProgress(updated);
}

export function deleteTarget(id: number, userId: number): void {
  writeTargets(readTargets().filter((target) => !(target.id === id && target.user_id === userId)));
}

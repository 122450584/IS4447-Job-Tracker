import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import { type PeriodType, type Target, applications, targets } from '@/db/schema';
import {
  buildTargetStreakSummary,
  type TargetStreakSummary,
} from '@/services/target-streak-utils';

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
  const applicationRows = db
    .select({
      category_id: applications.category_id,
      applied_date: applications.applied_date,
      metric_value: applications.metric_value,
    })
    .from(applications)
    .where(eq(applications.user_id, target.user_id))
    .all();

  const completed = applicationRows
    .filter((application) => {
      const matchesDate =
        application.applied_date >= target.start_date && application.applied_date <= target.end_date;
      const matchesCategory =
        target.category_id === null || application.category_id === target.category_id;

      return matchesDate && matchesCategory;
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
  initializeDatabase();

  const targetRows = db
    .select()
    .from(targets)
    .where(eq(targets.user_id, userId))
    .orderBy(desc(targets.start_date))
    .all();

  return targetRows.map(calculateProgress);
}

export function getTargetStreakSummary(userId: number): TargetStreakSummary {
  initializeDatabase();

  return buildTargetStreakSummary(listTargetProgress(userId));
}

export function createTarget(input: TargetInput): TargetProgress {
  initializeDatabase();

  const values = cleanTargetInput(input);
  const target = db
    .insert(targets)
    .values({
      user_id: values.userId,
      category_id: values.categoryId,
      period_type: values.periodType,
      target_value: values.targetValue,
      start_date: values.startDate,
      end_date: values.endDate,
    })
    .returning()
    .get();

  return calculateProgress(target);
}

export function updateTarget(input: UpdateTargetInput): TargetProgress {
  initializeDatabase();

  const values = cleanTargetInput(input);
  const target = db
    .update(targets)
    .set({
      category_id: values.categoryId,
      period_type: values.periodType,
      target_value: values.targetValue,
      start_date: values.startDate,
      end_date: values.endDate,
      updated_at: new Date(),
    })
    .where(and(eq(targets.id, input.id), eq(targets.user_id, values.userId)))
    .returning()
    .get();

  if (!target) {
    throw new Error('Target was not found.');
  }

  return calculateProgress(target);
}

export function deleteTarget(id: number, userId: number): void {
  initializeDatabase();

  db.delete(targets).where(and(eq(targets.id, id), eq(targets.user_id, userId))).run();
}

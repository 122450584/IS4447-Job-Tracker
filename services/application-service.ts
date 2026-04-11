import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import {
  type Application,
  type ApplicationStatus,
  type ApplicationStatusLog,
  applications,
  application_status_logs,
} from '@/db/schema';

export type ApplicationInput = {
  userId: number;
  categoryId: number;
  companyName: string;
  jobTitle: string;
  appliedDate: string;
  status: ApplicationStatus;
  notes?: string | null;
};

export type UpdateApplicationInput = ApplicationInput & {
  id: number;
};

function cleanApplicationInput(input: ApplicationInput) {
  const companyName = input.companyName.trim();
  const jobTitle = input.jobTitle.trim();
  const appliedDate = input.appliedDate.trim();

  if (!companyName) {
    throw new Error('Company name is required.');
  }

  if (!jobTitle) {
    throw new Error('Job title is required.');
  }

  if (!appliedDate || !/^\d{4}-\d{2}-\d{2}$/.test(appliedDate)) {
    throw new Error('Enter a valid date in YYYY-MM-DD format.');
  }

  return {
    userId: input.userId,
    categoryId: input.categoryId,
    companyName,
    jobTitle,
    appliedDate,
    status: input.status,
    notes: input.notes?.trim() || null,
  };
}

export function listApplications(userId: number): Application[] {
  initializeDatabase();

  return db
    .select()
    .from(applications)
    .where(eq(applications.user_id, userId))
    .orderBy(desc(applications.applied_date))
    .all();
}

export function listApplicationStatusLogs(
  applicationId: number,
  userId: number
): ApplicationStatusLog[] {
  initializeDatabase();

  const application = db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.user_id, userId)))
    .get();

  if (!application) {
    return [];
  }

  return db
    .select()
    .from(application_status_logs)
    .where(eq(application_status_logs.application_id, applicationId))
    .orderBy(desc(application_status_logs.changed_at))
    .all();
}

export function createApplication(input: ApplicationInput): Application {
  initializeDatabase();

  const values = cleanApplicationInput(input);

  return db.transaction((tx) => {
    const application = tx
      .insert(applications)
      .values({
        user_id: values.userId,
        category_id: values.categoryId,
        company_name: values.companyName,
        job_title: values.jobTitle,
        applied_date: values.appliedDate,
        current_status: values.status,
        metric_value: 1,
        notes: values.notes,
      })
      .returning()
      .get();

    tx.insert(application_status_logs)
      .values({
        application_id: application.id,
        status: values.status,
        changed_at: new Date(),
        notes: 'Initial status',
      })
      .run();

    return application;
  });
}

export function updateApplication(input: UpdateApplicationInput): Application {
  initializeDatabase();

  const values = cleanApplicationInput(input);

  return db.transaction((tx) => {
    const existing = tx
      .select({ current_status: applications.current_status })
      .from(applications)
      .where(and(eq(applications.id, input.id), eq(applications.user_id, values.userId)))
      .get();

    if (!existing) {
      throw new Error('Application was not found.');
    }

    const updated = tx
      .update(applications)
      .set({
        category_id: values.categoryId,
        company_name: values.companyName,
        job_title: values.jobTitle,
        applied_date: values.appliedDate,
        current_status: values.status,
        notes: values.notes,
        updated_at: new Date(),
      })
      .where(and(eq(applications.id, input.id), eq(applications.user_id, values.userId)))
      .returning()
      .get();

    if (existing.current_status !== values.status) {
      tx.insert(application_status_logs)
        .values({
          application_id: input.id,
          status: values.status,
          changed_at: new Date(),
          notes: `Status changed from ${existing.current_status} to ${values.status}`,
        })
        .run();
    }

    return updated;
  });
}

export function deleteApplication(id: number, userId: number): void {
  initializeDatabase();

  db.delete(applications)
    .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
    .run();
}

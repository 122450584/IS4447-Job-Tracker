import { type Application, type ApplicationStatus, type ApplicationStatusLog } from '@/db/schema';

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

type StoredApplication = Omit<Application, 'created_at' | 'updated_at'> & {
  created_at: string;
  updated_at: string;
};

type StoredApplicationStatusLog = Omit<ApplicationStatusLog, 'changed_at' | 'created_at'> & {
  changed_at: string;
  created_at: string;
};

const applicationsStorageKey = 'job_tracker_applications';
const statusLogsStorageKey = 'job_tracker_application_status_logs';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function toApplication(app: StoredApplication): Application {
  return {
    ...app,
    created_at: new Date(app.created_at),
    updated_at: new Date(app.updated_at),
  };
}

function toStoredApplication(app: Application): StoredApplication {
  return {
    ...app,
    created_at: app.created_at.toISOString(),
    updated_at: app.updated_at.toISOString(),
  };
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
    return (JSON.parse(stored) as StoredApplication[]).map(toApplication);
  } catch {
    return [];
  }
}

function writeApplications(apps: Application[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(
      applicationsStorageKey,
      JSON.stringify(apps.map(toStoredApplication))
    );
  }
}

function toStatusLog(log: StoredApplicationStatusLog): ApplicationStatusLog {
  return {
    ...log,
    changed_at: new Date(log.changed_at),
    created_at: new Date(log.created_at),
  };
}

function toStoredStatusLog(log: ApplicationStatusLog): StoredApplicationStatusLog {
  return {
    ...log,
    changed_at: log.changed_at.toISOString(),
    created_at: log.created_at.toISOString(),
  };
}

function readStatusLogs(): ApplicationStatusLog[] {
  if (!canUseStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(statusLogsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return (JSON.parse(stored) as StoredApplicationStatusLog[]).map(toStatusLog);
  } catch {
    return [];
  }
}

function writeStatusLogs(logs: ApplicationStatusLog[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(
      statusLogsStorageKey,
      JSON.stringify(logs.map(toStoredStatusLog))
    );
  }
}

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
  return readApplications()
    .filter((app) => app.user_id === userId)
    .sort((a, b) => b.applied_date.localeCompare(a.applied_date));
}

export function listApplicationStatusLogs(
  applicationId: number,
  userId: number
): ApplicationStatusLog[] {
  const application = readApplications().find(
    (app) => app.id === applicationId && app.user_id === userId
  );

  if (!application) {
    return [];
  }

  return readStatusLogs()
    .filter((log) => log.application_id === applicationId)
    .sort((a, b) => b.changed_at.getTime() - a.changed_at.getTime());
}

export function createApplication(input: ApplicationInput): Application {
  const values = cleanApplicationInput(input);
  const stored = readApplications();

  const now = new Date();
  const application: Application = {
    id: Date.now(),
    user_id: values.userId,
    category_id: values.categoryId,
    company_name: values.companyName,
    job_title: values.jobTitle,
    job_url: null,
    location: null,
    applied_date: values.appliedDate,
    current_status: values.status,
    metric_value: 1,
    notes: values.notes,
    created_at: now,
    updated_at: now,
  };

  writeApplications([...stored, application]);
  writeStatusLogs([
    ...readStatusLogs(),
    {
      id: Date.now() + 1,
      application_id: application.id,
      status: values.status,
      changed_at: now,
      notes: 'Initial status',
      created_at: now,
    },
  ]);

  return application;
}

export function updateApplication(input: UpdateApplicationInput): Application {
  const values = cleanApplicationInput(input);
  const stored = readApplications();

  const existing = stored.find((app) => app.id === input.id && app.user_id === values.userId);

  if (!existing) {
    throw new Error('Application was not found.');
  }

  const updated: Application = {
    ...existing,
    category_id: values.categoryId,
    company_name: values.companyName,
    job_title: values.jobTitle,
    applied_date: values.appliedDate,
    current_status: values.status,
    notes: values.notes,
    updated_at: new Date(),
  };

  writeApplications(stored.map((app) => (app.id === updated.id ? updated : app)));

  if (existing.current_status !== values.status) {
    const now = new Date();

    writeStatusLogs([
      ...readStatusLogs(),
      {
        id: Date.now() + 1,
        application_id: updated.id,
        status: values.status,
        changed_at: now,
        notes: `Status changed from ${existing.current_status} to ${values.status}`,
        created_at: now,
      },
    ]);
  }

  return updated;
}

export function deleteApplication(id: number, userId: number): void {
  const stored = readApplications();
  writeApplications(stored.filter((app) => !(app.id === id && app.user_id === userId)));
  writeStatusLogs(readStatusLogs().filter((log) => log.application_id !== id));
}

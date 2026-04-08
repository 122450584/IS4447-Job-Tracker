import { eq } from 'drizzle-orm';

import { db, sqliteClient } from './client';
import { initializeDatabase } from './init';
import {
  type ApplicationStatus,
  applications,
  application_status_logs,
  categories,
  settings,
  targets,
  users,
} from './schema';

const seedUserEmail = 'demo.jobtracker@example.com';

const seedCategories = [
  { key: 'software', name: 'Software Engineering', color: '#1E5B4F', icon: 'code' },
  { key: 'data', name: 'Data Analytics', color: '#2F6FED', icon: 'bar-chart' },
  { key: 'internship', name: 'Internships', color: '#B7791F', icon: 'school' },
  { key: 'remote', name: 'Remote Roles', color: '#7C3AED', icon: 'home' },
] as const;

type SeedCategoryKey = (typeof seedCategories)[number]['key'];

type SeedApplication = {
  key: string;
  categoryKey: SeedCategoryKey;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  appliedDate: string;
  currentStatus: ApplicationStatus;
  notes?: string;
};

const seedApplications: SeedApplication[] = [
  {
    key: 'greenbyte',
    categoryKey: 'software',
    companyName: 'GreenByte Labs',
    jobTitle: 'Junior React Native Developer',
    jobUrl: 'https://example.com/jobs/greenbyte-react-native',
    location: 'Cork',
    appliedDate: '2026-03-18',
    currentStatus: 'interviewing',
    notes: 'Phone screen completed; technical interview pending.',
  },
  {
    key: 'northstar',
    categoryKey: 'data',
    companyName: 'Northstar Insights',
    jobTitle: 'Graduate Data Analyst',
    location: 'Dublin',
    appliedDate: '2026-03-20',
    currentStatus: 'applied',
    notes: 'Applied through graduate careers portal.',
  },
  {
    key: 'harbour',
    categoryKey: 'internship',
    companyName: 'Harbour Tech',
    jobTitle: 'Software Engineering Intern',
    location: 'Limerick',
    appliedDate: '2026-03-25',
    currentStatus: 'rejected',
    notes: 'Useful role description for future applications.',
  },
  {
    key: 'cloudnest',
    categoryKey: 'remote',
    companyName: 'CloudNest',
    jobTitle: 'Remote Frontend Developer',
    jobUrl: 'https://example.com/jobs/cloudnest-frontend',
    location: 'Remote',
    appliedDate: '2026-03-29',
    currentStatus: 'offer',
    notes: 'Received offer; compare with other options.',
  },
  {
    key: 'fintrack',
    categoryKey: 'software',
    companyName: 'FinTrack Systems',
    jobTitle: 'Graduate Software Engineer',
    location: 'Galway',
    appliedDate: '2026-04-01',
    currentStatus: 'applied',
  },
  {
    key: 'civicanalytics',
    categoryKey: 'data',
    companyName: 'Civic Analytics',
    jobTitle: 'Junior BI Analyst',
    location: 'Dublin',
    appliedDate: '2026-04-03',
    currentStatus: 'interviewing',
    notes: 'Prepare SQL examples before interview.',
  },
  {
    key: 'pixelbridge',
    categoryKey: 'remote',
    companyName: 'PixelBridge',
    jobTitle: 'Mobile App Developer',
    location: 'Remote',
    appliedDate: '2026-04-05',
    currentStatus: 'withdrawn',
    notes: 'Role changed to senior level after applying.',
  },
  {
    key: 'learnloop',
    categoryKey: 'internship',
    companyName: 'LearnLoop',
    jobTitle: 'Product Engineering Intern',
    location: 'Cork',
    appliedDate: '2026-04-07',
    currentStatus: 'not_applied',
    notes: 'Saved for follow-up application this week.',
  },
];

const seedStatusLogs: Record<string, Array<{ status: ApplicationStatus; changedAt: Date; notes?: string }>> = {
  greenbyte: [
    { status: 'applied', changedAt: new Date('2026-03-18T09:30:00.000Z') },
    {
      status: 'interviewing',
      changedAt: new Date('2026-03-24T14:00:00.000Z'),
      notes: 'Moved to first interview.',
    },
  ],
  northstar: [{ status: 'applied', changedAt: new Date('2026-03-20T10:15:00.000Z') }],
  harbour: [
    { status: 'applied', changedAt: new Date('2026-03-25T11:00:00.000Z') },
    { status: 'rejected', changedAt: new Date('2026-04-02T16:30:00.000Z') },
  ],
  cloudnest: [
    { status: 'applied', changedAt: new Date('2026-03-29T08:45:00.000Z') },
    { status: 'interviewing', changedAt: new Date('2026-04-01T13:00:00.000Z') },
    { status: 'offer', changedAt: new Date('2026-04-06T15:15:00.000Z') },
  ],
  fintrack: [{ status: 'applied', changedAt: new Date('2026-04-01T09:10:00.000Z') }],
  civicanalytics: [
    { status: 'applied', changedAt: new Date('2026-04-03T12:40:00.000Z') },
    { status: 'interviewing', changedAt: new Date('2026-04-08T10:00:00.000Z') },
  ],
  pixelbridge: [
    { status: 'applied', changedAt: new Date('2026-04-05T17:20:00.000Z') },
    { status: 'withdrawn', changedAt: new Date('2026-04-07T09:30:00.000Z') },
  ],
  learnloop: [{ status: 'not_applied', changedAt: new Date('2026-04-07T18:00:00.000Z') }],
};

type SeedSummary = {
  users: number;
  categories: number;
  applications: number;
  applicationStatusLogs: number;
  targets: number;
  settings: number;
};

type CountRow = {
  count: number;
};

function countRows(tableName: string) {
  const row = sqliteClient.getFirstSync<CountRow>(`SELECT COUNT(*) AS count FROM ${tableName}`);

  return row?.count ?? 0;
}

export function getSeedSummary(): SeedSummary {
  return {
    users: countRows('users'),
    categories: countRows('categories'),
    applications: countRows('applications'),
    applicationStatusLogs: countRows('application_status_logs'),
    targets: countRows('targets'),
    settings: countRows('settings'),
  };
}

export function seedDatabase(): SeedSummary {
  initializeDatabase();

  const existingSeedUser = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, seedUserEmail))
    .get();

  if (existingSeedUser) {
    return getSeedSummary();
  }

  db.transaction((tx) => {
    const seedUser = tx
      .insert(users)
      .values({
        name: 'Demo Student',
        email: seedUserEmail,
        password_hash: 'demo-password-hash-not-a-secret',
      })
      .returning({ id: users.id })
      .get();

    const categoryIds = {} as Record<SeedCategoryKey, number>;

    for (const category of seedCategories) {
      const insertedCategory = tx
        .insert(categories)
        .values({
          user_id: seedUser.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
        })
        .returning({ id: categories.id })
        .get();

      categoryIds[category.key] = insertedCategory.id;
    }

    const applicationIds = {} as Record<string, number>;

    for (const application of seedApplications) {
      const insertedApplication = tx
        .insert(applications)
        .values({
          user_id: seedUser.id,
          category_id: categoryIds[application.categoryKey],
          company_name: application.companyName,
          job_title: application.jobTitle,
          job_url: application.jobUrl,
          location: application.location,
          applied_date: application.appliedDate,
          metric_value: 1,
          current_status: application.currentStatus,
          notes: application.notes,
        })
        .returning({ id: applications.id })
        .get();

      applicationIds[application.key] = insertedApplication.id;
    }

    for (const [applicationKey, logs] of Object.entries(seedStatusLogs)) {
      for (const log of logs) {
        tx.insert(application_status_logs)
          .values({
            application_id: applicationIds[applicationKey],
            status: log.status,
            changed_at: log.changedAt,
            notes: log.notes,
          })
          .run();
      }
    }

    tx.insert(targets)
      .values([
        {
          user_id: seedUser.id,
          category_id: null,
          period_type: 'weekly',
          target_value: 5,
          start_date: '2026-04-06',
          end_date: '2026-04-12',
        },
        {
          user_id: seedUser.id,
          category_id: null,
          period_type: 'monthly',
          target_value: 16,
          start_date: '2026-04-01',
          end_date: '2026-04-30',
        },
        {
          user_id: seedUser.id,
          category_id: categoryIds.software,
          period_type: 'monthly',
          target_value: 6,
          start_date: '2026-04-01',
          end_date: '2026-04-30',
        },
      ])
      .run();

    tx.insert(settings)
      .values({
        user_id: seedUser.id,
        theme_preference: 'system',
      })
      .run();
  });

  return getSeedSummary();
}

type StoredUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

type StoredCategory = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

type StoredApplication = {
  id: number;
  user_id: number;
  category_id: number;
  company_name: string;
  job_title: string;
  job_url: string | null;
  location: string | null;
  applied_date: string;
  metric_value: number;
  current_status: 'not_applied' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type StoredStatusLog = {
  id: number;
  application_id: number;
  status: 'not_applied' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  changed_at: string;
  notes: string | null;
  created_at: string;
};

type StoredTarget = {
  id: number;
  user_id: number;
  category_id: number | null;
  period_type: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

type StoredSettings = {
  user_id: number;
  theme_preference: 'system' | 'light' | 'dark';
  daily_reminder_enabled: number;
  daily_reminder_time: string;
  daily_reminder_notification_id: string | null;
};

const usersStorageKey = 'job_tracker_users';
const categoriesStorageKey = 'job_tracker_categories';
const applicationsStorageKey = 'job_tracker_applications';
const statusLogsStorageKey = 'job_tracker_application_status_logs';
const targetsStorageKey = 'job_tracker_targets';
const settingsStorageKey = 'job_tracker_settings';

const demoUserId = 1;
const demoUserEmail = 'demo@gmail.com';
const demoPasswordHash = '94057203e97ed045baa64de38e1e65b5b558ba2470da812c2074691357da0d93';

let hasInitializedSeed = false;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readList<T>(key: string): T[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, rows: T[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(rows));
  }
}

export function initializeSeedData() {
  if (hasInitializedSeed || !canUseStorage()) {
    return;
  }

  const users = readList<StoredUser>(usersStorageKey);
  const hasDemoUser = users.some((user) => user.email === demoUserEmail);

  const now = new Date().toISOString();

  const categories: StoredCategory[] = [
    { id: 1, user_id: demoUserId, name: 'Software Engineering', color: '#1E5B4F', icon: 'code', created_at: now, updated_at: now },
    { id: 2, user_id: demoUserId, name: 'Data Analytics', color: '#2F6FED', icon: 'bar-chart', created_at: now, updated_at: now },
    { id: 3, user_id: demoUserId, name: 'Internships', color: '#B7791F', icon: 'school', created_at: now, updated_at: now },
    { id: 4, user_id: demoUserId, name: 'Remote Roles', color: '#7C3AED', icon: 'home', created_at: now, updated_at: now },
  ];

  const applications: StoredApplication[] = [
    { id: 1, user_id: demoUserId, category_id: 1, company_name: 'GreenByte Labs', job_title: 'Junior React Native Developer', job_url: 'https://example.com/jobs/greenbyte-react-native', location: 'Cork', applied_date: '2026-03-18', metric_value: 1, current_status: 'interviewing', notes: 'Phone screen completed; technical interview pending.', created_at: now, updated_at: now },
    { id: 2, user_id: demoUserId, category_id: 2, company_name: 'Northstar Insights', job_title: 'Graduate Data Analyst', job_url: null, location: 'Dublin', applied_date: '2026-03-20', metric_value: 1, current_status: 'applied', notes: 'Applied through graduate careers portal.', created_at: now, updated_at: now },
    { id: 3, user_id: demoUserId, category_id: 3, company_name: 'Harbour Tech', job_title: 'Software Engineering Intern', job_url: null, location: 'Limerick', applied_date: '2026-03-25', metric_value: 1, current_status: 'rejected', notes: 'Useful role description for future applications.', created_at: now, updated_at: now },
    { id: 4, user_id: demoUserId, category_id: 4, company_name: 'CloudNest', job_title: 'Remote Frontend Developer', job_url: 'https://example.com/jobs/cloudnest-frontend', location: 'Remote', applied_date: '2026-04-14', metric_value: 1, current_status: 'offer', notes: 'Received offer; compare with other options.', created_at: now, updated_at: now },
    { id: 5, user_id: demoUserId, category_id: 1, company_name: 'FinTrack Systems', job_title: 'Graduate Software Engineer', job_url: null, location: 'Galway', applied_date: '2026-04-17', metric_value: 1, current_status: 'applied', notes: null, created_at: now, updated_at: now },
    { id: 6, user_id: demoUserId, category_id: 2, company_name: 'Civic Analytics', job_title: 'Junior BI Analyst', job_url: null, location: 'Dublin', applied_date: '2026-04-18', metric_value: 1, current_status: 'interviewing', notes: 'Prepare SQL examples before interview.', created_at: now, updated_at: now },
    { id: 7, user_id: demoUserId, category_id: 4, company_name: 'PixelBridge', job_title: 'Mobile App Developer', job_url: null, location: 'Remote', applied_date: '2026-04-19', metric_value: 1, current_status: 'withdrawn', notes: 'Role changed to senior level after applying.', created_at: now, updated_at: now },
    { id: 8, user_id: demoUserId, category_id: 3, company_name: 'LearnLoop', job_title: 'Product Engineering Intern', job_url: null, location: 'Cork', applied_date: '2026-04-19', metric_value: 1, current_status: 'not_applied', notes: 'Saved for follow-up application this week.', created_at: now, updated_at: now },
  ];

  const statusLogs: StoredStatusLog[] = [
    { id: 1, application_id: 1, status: 'applied', changed_at: new Date('2026-03-18T09:30:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 2, application_id: 1, status: 'interviewing', changed_at: new Date('2026-03-24T14:00:00.000Z').toISOString(), notes: 'Moved to first interview.', created_at: now },
    { id: 3, application_id: 2, status: 'applied', changed_at: new Date('2026-03-20T10:15:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 4, application_id: 3, status: 'applied', changed_at: new Date('2026-03-25T11:00:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 5, application_id: 3, status: 'rejected', changed_at: new Date('2026-04-02T16:30:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 6, application_id: 4, status: 'applied', changed_at: new Date('2026-04-14T08:45:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 7, application_id: 4, status: 'interviewing', changed_at: new Date('2026-04-15T13:00:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 8, application_id: 4, status: 'offer', changed_at: new Date('2026-04-16T15:15:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 9, application_id: 5, status: 'applied', changed_at: new Date('2026-04-17T09:10:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 10, application_id: 6, status: 'applied', changed_at: new Date('2026-04-18T12:40:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 11, application_id: 6, status: 'interviewing', changed_at: new Date('2026-04-19T10:00:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 12, application_id: 7, status: 'applied', changed_at: new Date('2026-04-19T09:20:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 13, application_id: 7, status: 'withdrawn', changed_at: new Date('2026-04-19T17:30:00.000Z').toISOString(), notes: null, created_at: now },
    { id: 14, application_id: 8, status: 'not_applied', changed_at: new Date('2026-04-19T18:00:00.000Z').toISOString(), notes: null, created_at: now },
  ];

  const targets: StoredTarget[] = [
    { id: 1, user_id: demoUserId, category_id: null, period_type: 'weekly', target_value: 6, start_date: '2026-04-14', end_date: '2026-04-20', created_at: now, updated_at: now },
    { id: 2, user_id: demoUserId, category_id: null, period_type: 'monthly', target_value: 3, start_date: '2026-04-01', end_date: '2026-04-30', created_at: now, updated_at: now },
    { id: 3, user_id: demoUserId, category_id: 1, period_type: 'monthly', target_value: 6, start_date: '2026-04-01', end_date: '2026-04-30', created_at: now, updated_at: now },
  ];

  const settings: StoredSettings[] = [
    {
      user_id: demoUserId,
      theme_preference: 'system',
      daily_reminder_enabled: 0,
      daily_reminder_time: '09:00',
      daily_reminder_notification_id: null,
    },
  ];

  const nextUsers = hasDemoUser
    ? users.map((user) =>
        user.email === demoUserEmail
          ? {
              ...user,
              id: demoUserId,
              name: 'Demo Student',
              password_hash: demoPasswordHash,
            }
          : user
      )
    : [
        ...users,
        {
          id: demoUserId,
          name: 'Demo Student',
          email: demoUserEmail,
          password_hash: demoPasswordHash,
        },
      ];

  const allApplications = readList<StoredApplication>(applicationsStorageKey);
  const otherApplications = allApplications.filter((application) => application.user_id !== demoUserId);
  const otherApplicationIds = new Set(otherApplications.map((application) => application.id));

  writeList(usersStorageKey, nextUsers);
  writeList(
    categoriesStorageKey,
    [
      ...readList<StoredCategory>(categoriesStorageKey).filter((category) => category.user_id !== demoUserId),
      ...categories,
    ]
  );
  writeList(applicationsStorageKey, [...otherApplications, ...applications]);
  writeList(
    statusLogsStorageKey,
    [
      ...readList<StoredStatusLog>(statusLogsStorageKey).filter((statusLog) =>
        otherApplicationIds.has(statusLog.application_id)
      ),
      ...statusLogs,
    ]
  );
  writeList(
    targetsStorageKey,
    [...readList<StoredTarget>(targetsStorageKey).filter((target) => target.user_id !== demoUserId), ...targets]
  );
  writeList(
    settingsStorageKey,
    [
      ...readList<StoredSettings>(settingsStorageKey).filter((setting) => setting.user_id !== demoUserId),
      ...settings,
    ]
  );

  hasInitializedSeed = true;
}

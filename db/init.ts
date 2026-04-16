import { sqliteClient } from './client';

type CountRow = {
  count: number;
};

type TableColumn = {
  name: string;
};

function addColumnIfMissing(tableName: string, columnName: string, columnDefinition: string) {
  if ('getAllSync' in sqliteClient && typeof sqliteClient.getAllSync === 'function') {
    const columns = sqliteClient.getAllSync<TableColumn>(`PRAGMA table_info(${tableName})`);
    const columnExists = columns.some((column) => column.name === columnName);

    if (!columnExists) {
      sqliteClient.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
    }

    return;
  }

  let columnExists = false;

  try {
    const row = sqliteClient.getFirstSync<CountRow>(
      `SELECT COUNT(*) AS count FROM pragma_table_info('${tableName}') WHERE name = '${columnName}'`
    );
    columnExists = (row?.count ?? 0) > 0;
  } catch {
    columnExists = false;
  }

  if (!columnExists) {
    sqliteClient.execSync(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  }
}

export function initializeDatabase() {
  sqliteClient.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
      ON users (email);

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS categories_user_id_name_unique
      ON categories (user_id, name);

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      job_url TEXT,
      location TEXT,
      applied_date TEXT NOT NULL,
      metric_value INTEGER NOT NULL DEFAULT 1,
      current_status TEXT NOT NULL DEFAULT 'not_applied',
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE NO ACTION,
      CONSTRAINT applications_current_status_check
        CHECK (current_status IN ('not_applied', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
      CONSTRAINT applications_metric_value_positive_check
        CHECK (metric_value > 0)
    );

    CREATE TABLE IF NOT EXISTS application_status_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      changed_at INTEGER NOT NULL DEFAULT (unixepoch()),
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
      CONSTRAINT application_status_logs_status_check
        CHECK (status IN ('not_applied', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'))
    );

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      period_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      CONSTRAINT targets_period_type_check
        CHECK (period_type IN ('daily', 'weekly', 'monthly')),
      CONSTRAINT targets_target_value_positive_check
        CHECK (target_value > 0),
      CONSTRAINT targets_date_range_check
        CHECK (end_date >= start_date)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      theme_preference TEXT NOT NULL DEFAULT 'system',
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      daily_reminder_time TEXT NOT NULL DEFAULT '09:00',
      daily_reminder_notification_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT settings_theme_preference_check
        CHECK (theme_preference IN ('system', 'light', 'dark')),
      CONSTRAINT settings_daily_reminder_enabled_check
        CHECK (daily_reminder_enabled IN (0, 1))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS settings_user_id_unique
      ON settings (user_id);
  `);

  addColumnIfMissing(
    'settings',
    'daily_reminder_enabled',
    'daily_reminder_enabled INTEGER NOT NULL DEFAULT 0'
  );
  addColumnIfMissing(
    'settings',
    'daily_reminder_time',
    "daily_reminder_time TEXT NOT NULL DEFAULT '09:00'"
  );
  addColumnIfMissing(
    'settings',
    'daily_reminder_notification_id',
    'daily_reminder_notification_id TEXT'
  );
}

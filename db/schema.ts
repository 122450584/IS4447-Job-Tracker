import { relations, sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const applicationStatuses = [
  'not_applied',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const periodTypes = ['daily', 'weekly', 'monthly'] as const;

export type PeriodType = (typeof periodTypes)[number];

export const themePreferences = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof themePreferences)[number];

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password_hash: text('password_hash').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)]
);

export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').notNull(),
    icon: text('icon').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('categories_user_id_name_unique').on(table.user_id, table.name)]
);

export const applications = sqliteTable(
  'applications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category_id: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'no action' }),
    company_name: text('company_name').notNull(),
    job_title: text('job_title').notNull(),
    job_url: text('job_url'),
    location: text('location'),
    applied_date: text('applied_date').notNull(),
    metric_value: integer('metric_value').notNull().default(1),
    current_status: text('current_status', { enum: applicationStatuses })
      .notNull()
      .default('not_applied'),
    notes: text('notes'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    check(
      'applications_current_status_check',
      sql`${table.current_status} in ('not_applied', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')`
    ),
    check('applications_metric_value_positive_check', sql`${table.metric_value} > 0`),
  ]
);

export const application_status_logs = sqliteTable(
  'application_status_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    application_id: integer('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    status: text('status', { enum: applicationStatuses }).notNull(),
    changed_at: integer('changed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    notes: text('notes'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    check(
      'application_status_logs_status_check',
      sql`${table.status} in ('not_applied', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')`
    ),
  ]
);

export const targets = sqliteTable(
  'targets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category_id: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
    period_type: text('period_type', { enum: periodTypes }).notNull(),
    target_value: integer('target_value').notNull(),
    start_date: text('start_date').notNull(),
    end_date: text('end_date').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    check('targets_period_type_check', sql`${table.period_type} in ('daily', 'weekly', 'monthly')`),
    check('targets_target_value_positive_check', sql`${table.target_value} > 0`),
    check('targets_date_range_check', sql`${table.end_date} >= ${table.start_date}`),
  ]
);

export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    theme_preference: text('theme_preference', { enum: themePreferences })
      .notNull()
      .default('system'),
  },
  (table) => [
    uniqueIndex('settings_user_id_unique').on(table.user_id),
    check('settings_theme_preference_check', sql`${table.theme_preference} in ('system', 'light', 'dark')`),
  ]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  categories: many(categories),
  applications: many(applications),
  targets: many(targets),
  settings: one(settings),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.user_id],
    references: [users.id],
  }),
  applications: many(applications),
  targets: many(targets),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.user_id],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [applications.category_id],
    references: [categories.id],
  }),
  status_logs: many(application_status_logs),
}));

export const applicationStatusLogsRelations = relations(application_status_logs, ({ one }) => ({
  application: one(applications, {
    fields: [application_status_logs.application_id],
    references: [applications.id],
  }),
}));

export const targetsRelations = relations(targets, ({ one }) => ({
  user: one(users, {
    fields: [targets.user_id],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [targets.category_id],
    references: [categories.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.user_id],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type ApplicationStatusLog = typeof application_status_logs.$inferSelect;
export type NewApplicationStatusLog = typeof application_status_logs.$inferInsert;

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

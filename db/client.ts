import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const databaseName = 'job_tracker.db';

export const sqliteClient = openDatabaseSync(databaseName);

export const db = drizzle(sqliteClient, { schema });

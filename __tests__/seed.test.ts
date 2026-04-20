jest.mock('@/db/client', () => {
  const schema = jest.requireActual<typeof import('@/db/schema')>('@/db/schema');

  const rows: Record<string, Array<Record<string, unknown>>> = {
    users: [],
    categories: [],
    applications: [],
    application_status_logs: [],
    targets: [],
    settings: [],
  };

  const nextIds: Record<string, number> = {
    users: 1,
    categories: 1,
    applications: 1,
    application_status_logs: 1,
    targets: 1,
    settings: 1,
  };

  function resetMockDatabase() {
    for (const tableName of Object.keys(rows)) {
      rows[tableName] = [];
      nextIds[tableName] = 1;
    }
  }

  function getTableName(table: unknown): string {
    if (table === schema.users) {
      return 'users';
    }

    if (table === schema.categories) {
      return 'categories';
    }

    if (table === schema.applications) {
      return 'applications';
    }

    if (table === schema.application_status_logs) {
      return 'application_status_logs';
    }

    if (table === schema.targets) {
      return 'targets';
    }

    if (table === schema.settings) {
      return 'settings';
    }

    throw new Error('Unknown table');
  }

  function insertRows(tableName: string, values: Record<string, unknown> | Record<string, unknown>[]) {
    const valuesList = Array.isArray(values) ? values : [values];
    const insertedRows = valuesList.map((value) => {
      const row = {
        id: nextIds[tableName],
        ...value,
      };

      nextIds[tableName] += 1;
      rows[tableName].push(row);

      return row;
    });

    return insertedRows;
  }

  function createInsertBuilder(table: unknown) {
    const tableName = getTableName(table);

    return {
      values(values: Record<string, unknown> | Record<string, unknown>[]) {
        const insertedRows = insertRows(tableName, values);

        return {
          returning() {
            return {
              get() {
                return { id: insertedRows[0].id };
              },
            };
          },
          run() {
            return {
              changes: insertedRows.length,
              lastInsertRowId: insertedRows[insertedRows.length - 1].id,
            };
          },
        };
      },
    };
  }

  const mockDb: {
    select: () => {
      from: () => {
        where: () => {
          get: () => Record<string, unknown> | undefined;
        };
      };
    };
    insert: typeof createInsertBuilder;
    transaction: <T>(callback: (tx: { insert: typeof createInsertBuilder }) => T) => T;
  } = {
    select() {
      return {
        from() {
          return {
            where() {
              return {
                get() {
                  return rows.users.find((user) => user.email === 'demo@gmail.com');
                },
              };
            },
          };
        },
      };
    },
    insert: createInsertBuilder,
    transaction<T>(callback: (tx: typeof mockDb) => T) {
      return callback(mockDb);
    },
  };

  const sqliteClient = {
    execSync: jest.fn(),
    getFirstSync: jest.fn((query: string) => {
      const tableName = query.match(/FROM\s+([a-z_]+)/i)?.[1];

      return tableName ? { count: rows[tableName].length } : null;
    }),
  };

  return {
    databaseName: 'job_tracker.db',
    db: mockDb,
    resetMockDatabase,
    sqliteClient,
  };
});

import { seedDatabase } from '@/db/seed';

const { resetMockDatabase } = jest.requireMock('@/db/client') as {
  resetMockDatabase: () => void;
};

describe('seedDatabase', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('populates all core tables without duplicating data', () => {
    const firstRun = seedDatabase();
    const secondRun = seedDatabase();

    expect(firstRun).toEqual({
      users: 1,
      categories: 4,
      applications: 8,
      applicationStatusLogs: 14,
      targets: 3,
      settings: 1,
    });

    expect(secondRun).toEqual(firstRun);
  });
});

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
    if (table === schema.users) return 'users';
    if (table === schema.categories) return 'categories';
    if (table === schema.applications) return 'applications';
    if (table === schema.application_status_logs) return 'application_status_logs';
    if (table === schema.targets) return 'targets';
    if (table === schema.settings) return 'settings';
    throw new Error('Unknown table');
  }

  function insertRows(
    tableName: string,
    values: Record<string, unknown> | Record<string, unknown>[]
  ) {
    const valuesList = Array.isArray(values) ? values : [values];
    const insertedRows = valuesList.map((value) => {
      const row = { id: nextIds[tableName], ...value };
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

  type MockDb = {
    select: () => {
      from: (table: unknown) => {
        where: () => {
          get: () => Record<string, unknown> | undefined;
          orderBy: () => {
            all: () => Record<string, unknown>[];
          };
        };
      };
    };
    insert: typeof createInsertBuilder;
    transaction: <T>(callback: (tx: MockDb) => T) => T;
  };

  const mockDb: MockDb = {
    select() {
      return {
        from(table: unknown) {
          const tableName = getTableName(table);
          return {
            where() {
              return {
                get() {
                  return rows.users.find((u) => u.email === 'demo.jobtracker@example.com');
                },
                orderBy() {
                  return {
                    all() {
                      return [...rows[tableName]];
                    },
                  };
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
import { listApplications } from '@/services/application-service';

const { resetMockDatabase } = jest.requireMock('@/db/client') as {
  resetMockDatabase: () => void;
};

describe('listApplications', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('returns seeded applications after database initialisation', () => {
    seedDatabase();

    const applications = listApplications(1);

    expect(applications).toHaveLength(8);

    const companyNames = applications.map((app) => app.company_name);
    expect(companyNames).toContain('GreenByte Labs');
    expect(companyNames).toContain('Northstar Insights');
    expect(companyNames).toContain('CloudNest');
  });
});

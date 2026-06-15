import type { Migration, MigrationRunner, MigrationStatus } from "@extora/types";

export abstract class BaseMigration implements Migration {
  abstract name: string;
  abstract version: string;

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;
}

export function createMigrationRunner(
  pluginName: string,
  appliedMigrations: MigrationStatus[] = [],
): MigrationRunner {
  const migrations: Migration[] = [];

  return {
    register(migration: Migration): void {
      migrations.push(migration);
    },

    async runPending(): Promise<void> {
      const applied = new Set(appliedMigrations.filter((m) => m.applied).map((m) => m.name));

      for (const migration of migrations) {
        if (!applied.has(migration.name)) {
          await migration.up();
          appliedMigrations.push({
            name: migration.name,
            version: migration.version,
            applied: true,
            appliedAt: new Date(),
          });
          applied.add(migration.name);
        }
      }
    },

    async rollback(steps: number): Promise<void> {
      const applied = appliedMigrations.filter((m) => m.applied);
      const toRollback = applied.slice(-steps);

      for (const status of toRollback) {
        const migration = migrations.find((m) => m.name === status.name);
        if (migration) {
          await migration.down();
          status.applied = false;
          status.appliedAt = null;
        }
      }
    },

    async status(): Promise<MigrationStatus[]> {
      const result: MigrationStatus[] = [...appliedMigrations];

      for (const migration of migrations) {
        if (!result.find((s) => s.name === migration.name)) {
          result.push({
            name: migration.name,
            version: migration.version,
            applied: false,
            appliedAt: null,
          });
        }
      }

      return result;
    },
  };
}

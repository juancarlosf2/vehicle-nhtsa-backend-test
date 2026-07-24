export const DATABASE_OPTIONS = Symbol("DATABASE_OPTIONS");

export interface DatabaseOptions {
  databasePath: string;
  migrationsPath: string;
}

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { projects, tasks, timeSessions } from './schema';

// Create SQLite connection
const sqlite = new Database('./database.sqlite');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, {
  schema: { projects, tasks, timeSessions }
});

// Run migrations on startup
export function initializeDatabase() {
  try {
    migrate(db, { migrationsFolder: './src/lib/db/migrations' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
  }
}

// Export schema for use in other files
export { projects, tasks, timeSessions } from './schema';
export type * from './schema';
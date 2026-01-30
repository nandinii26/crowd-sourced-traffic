import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/traffic'
});

export async function initDb() {
  try {
    await pool.connect();
    console.log('Postgres connected');
  } catch (err) {
    console.warn('Postgres connection failed (continuing without DB):', err instanceof Error ? err.message : err);
  }
}

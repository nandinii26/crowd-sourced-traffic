import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/traffic'
});

export async function initDb() {
  await pool.connect();
  console.log('Postgres connected');
}

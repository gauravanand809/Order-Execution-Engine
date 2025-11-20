import { Pool } from 'pg';

const connectionString = process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/order_exec';

export const pool = new Pool({ connectionString });

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        payload JSONB,
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        last_error TEXT
      );
    `);
  } finally {
    client.release();
  }
}

export async function closeDb() {
  await pool.end();
}

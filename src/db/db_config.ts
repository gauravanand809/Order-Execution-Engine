import type { FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export default async function dbPlugin(fastify: FastifyInstance) {
  const pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  const db = drizzle(pool, { schema });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

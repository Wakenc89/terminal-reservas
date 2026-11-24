import pg from 'pg';
import { env } from './env.js';

export const pool = new pg.Pool(env.db);

// Consulta simple (parametrizada: evita inyección SQL, RNF6)
export const query = (text, params) => pool.query(text, params);

// Transacción atómica (ACID, RNF8). La usaremos en Sprint 3 con SELECT ... FOR UPDATE.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

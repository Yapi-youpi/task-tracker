import pg from 'pg';
import { databaseUrl } from '../config/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

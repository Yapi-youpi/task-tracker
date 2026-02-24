import 'dotenv/config';
import { port, databaseUrl } from './config/index.js';
import { pool } from './db/pool.js';
import { initDb } from './db/init.js';
import app from './app.js';

async function start() {
  if (!databaseUrl) {
    console.error(
      'Set DATABASE_URL (e.g. postgresql://user:password@localhost:5432/task_tracker)'
    );
    process.exit(1);
  }
  try {
    await initDb(pool);
    console.log('Database schema ready');
  } catch (e) {
    console.error('Database init failed:', e.message);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Task Tracker API: http://localhost:${port}/api`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function initDb(pool) {
  const schemaPath = join(__dirname, '..', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
}

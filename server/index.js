import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'task-tracker-secret-change-in-production';

app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] }));
app.use(express.json());

async function initDb() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
}

async function findUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, email, name, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return res.rows[0] || null;
}

async function findUserById(id) {
  const res = await pool.query(
    'SELECT id, email, name FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    const user = await findUserById(payload.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  });
}

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    order: row.order,
  };
}

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)',
      [id, email.trim().toLowerCase(), name.trim(), passwordHash]
    );
    const user = { id, email: email.trim(), name: name.trim() };
    const accessToken = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ accessToken, user });
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  return res.json(req.user);
});

// ---------- Tasks ----------
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, status, priority, deadline, created_at, updated_at, "order" FROM tasks WHERE user_id = $1 ORDER BY "order" ASC, created_at ASC',
      [req.user.id]
    );
    return res.json(result.rows.map(rowToTask));
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to load tasks' });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, deadline } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const id = uuidv4();
    const validStatuses = ['todo', 'in-progress', 'in-review', 'in-testing', 'done'];
    const taskStatus = validStatuses.includes(status) ? status : 'todo';
    const taskPriority = priority === 'low' || priority === 'high' ? priority : 'medium';
    const deadlineVal = deadline && String(deadline).trim() ? String(deadline).trim() : null;
    const result = await pool.query(
      `SELECT "order" FROM tasks WHERE user_id = $1 ORDER BY "order" DESC LIMIT 1`,
      [req.user.id]
    );
    const order = result.rows[0] ? result.rows[0].order + 1 : 0;
    await pool.query(
      `INSERT INTO tasks (id, user_id, title, description, status, priority, deadline, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, req.user.id, title.trim(), (description && String(description).trim()) || '', taskStatus, taskPriority, deadlineVal, order]
    );
    const row = (await pool.query(
      'SELECT id, title, description, status, priority, deadline, created_at, updated_at, "order" FROM tasks WHERE id = $1',
      [id]
    )).rows[0];
    return res.status(201).json(rowToTask(row));
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, deadline, order } = req.body || {};
    const check = await pool.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const updates = [];
    const values = [];
    let i = 1;
    if (title !== undefined) { updates.push(`title = $${i++}`); values.push(String(title).trim()); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(String(description).trim()); }
    if (status !== undefined && ['todo', 'in-progress', 'in-review', 'in-testing', 'done'].includes(status)) { updates.push(`status = $${i++}`); values.push(status); }
    if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) { updates.push(`priority = $${i++}`); values.push(priority); }
    if (deadline !== undefined) { updates.push(`deadline = $${i++}`); values.push(deadline && String(deadline).trim() ? String(deadline).trim() : null); }
    if (typeof order === 'number') { updates.push(`"order" = $${i++}`); values.push(order); }
    updates.push('updated_at = NOW()');
    values.push(id, req.user.id);
    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
      values
    );
    const row = (await pool.query(
      'SELECT id, title, description, status, priority, deadline, created_at, updated_at, "order" FROM tasks WHERE id = $1',
      [id]
    )).rows[0];
    return res.json(rowToTask(row));
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to delete task' });
  }
});

app.patch('/api/tasks/reorder', authMiddleware, async (req, res) => {
  try {
    const order = req.body?.order;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'order array required' });
    }
    const client = await pool.connect();
    try {
      for (let i = 0; i < order.length; i++) {
        await client.query(
          'UPDATE tasks SET "order" = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
          [i, order[i], req.user.id]
        );
      }
      return res.json({ order });
    } finally {
      client.release();
    }
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to reorder' });
  }
});

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('Set DATABASE_URL (e.g. postgresql://user:password@localhost:5432/task_tracker)');
    process.exit(1);
  }
  try {
    await initDb();
    console.log('Database schema ready');
  } catch (e) {
    console.error('Database init failed:', e.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Task Tracker API: http://localhost:${PORT}/api`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool.js';
import { rowToTask } from '../utils/task.mapper.js';
import {
  VALID_TASK_STATUSES,
  VALID_PRIORITIES,
} from '../utils/constants.js';

const taskSelectColumns =
  'id, title, description, status, priority, deadline, created_at, updated_at, "order"';

export async function getTasks(userId) {
  const result = await pool.query(
    `SELECT ${taskSelectColumns} FROM tasks WHERE user_id = $1 ORDER BY "order" ASC, created_at ASC`,
    [userId]
  );
  return result.rows.map(rowToTask);
}

export async function createTask(userId, payload) {
  const { title, description, status, priority, deadline } = payload || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    const err = new Error('Title is required');
    err.status = 400;
    throw err;
  }
  const id = uuidv4();
  const taskStatus = VALID_TASK_STATUSES.includes(status) ? status : 'todo';
  const taskPriority = VALID_PRIORITIES.includes(priority) ? priority : 'medium';
  const deadlineVal =
    deadline && String(deadline).trim() ? String(deadline).trim() : null;
  const orderResult = await pool.query(
    `SELECT "order" FROM tasks WHERE user_id = $1 ORDER BY "order" DESC LIMIT 1`,
    [userId]
  );
  const order = orderResult.rows[0] ? orderResult.rows[0].order + 1 : 0;
  await pool.query(
    `INSERT INTO tasks (id, user_id, title, description, status, priority, deadline, "order")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      userId,
      title.trim(),
      (description && String(description).trim()) || '',
      taskStatus,
      taskPriority,
      deadlineVal,
      order,
    ]
  );
  const row = (
    await pool.query(`SELECT ${taskSelectColumns} FROM tasks WHERE id = $1`, [
      id,
    ])
  ).rows[0];
  return rowToTask(row);
}

export async function updateTask(userId, taskId, payload) {
  const { title, description, status, priority, deadline, order } =
    payload || {};
  const check = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  if (check.rows.length === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  const updates = [];
  const values = [];
  let i = 1;
  if (title !== undefined) {
    updates.push(`title = $${i++}`);
    values.push(String(title).trim());
  }
  if (description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(String(description).trim());
  }
  if (
    status !== undefined &&
    VALID_TASK_STATUSES.includes(status)
  ) {
    updates.push(`status = $${i++}`);
    values.push(status);
  }
  if (priority !== undefined && VALID_PRIORITIES.includes(priority)) {
    updates.push(`priority = $${i++}`);
    values.push(priority);
  }
  if (deadline !== undefined) {
    updates.push(`deadline = $${i++}`);
    values.push(
      deadline && String(deadline).trim() ? String(deadline).trim() : null
    );
  }
  if (typeof order === 'number') {
    updates.push(`"order" = $${i++}`);
    values.push(order);
  }
  updates.push('updated_at = NOW()');
  values.push(taskId, userId);
  await pool.query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
    values
  );
  const row = (
    await pool.query(`SELECT ${taskSelectColumns} FROM tasks WHERE id = $1`, [
      taskId,
    ])
  ).rows[0];
  return rowToTask(row);
}

export async function deleteTask(userId, taskId) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [taskId, userId]
  );
  if (result.rowCount === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
}

export async function reorderTasks(userId, orderIds) {
  const client = await pool.connect();
  try {
    for (let i = 0; i < orderIds.length; i++) {
      await client.query(
        'UPDATE tasks SET "order" = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
        [i, orderIds[i], userId]
      );
    }
    return { order: orderIds };
  } finally {
    client.release();
  }
}

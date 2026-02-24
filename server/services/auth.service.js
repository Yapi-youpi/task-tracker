import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool.js';
import { jwtSecret } from '../config/index.js';

export async function findUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, email, name, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return res.rows[0] || null;
}

export async function findUserById(id) {
  const res = await pool.query(
    'SELECT id, email, name FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

export async function register({ name, email, password }) {
  if (!email || !password || !name) {
    const err = new Error('Name, email and password are required');
    err.status = 400;
    throw err;
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('User with this email already exists');
    err.status = 400;
    throw err;
  }
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)',
    [id, email.trim().toLowerCase(), name.trim(), passwordHash]
  );
  const user = { id, email: email.trim(), name: name.trim() };
  const accessToken = jwt.sign({ userId: id }, jwtSecret, { expiresIn: '7d' });
  return { accessToken, user };
}

export async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const accessToken = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: '7d',
  });
  return {
    accessToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

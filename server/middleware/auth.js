import jwt from 'jsonwebtoken';
import { findUserById } from '../services/auth.service.js';
import { jwtSecret } from '../config/index.js';

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: err.name === 'TokenExpiredError' ? 'Invalid or expired token' : 'Invalid or expired token' });
  }
}

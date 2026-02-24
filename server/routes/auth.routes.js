import { Router } from 'express';
import * as authService from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await authService.register(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await authService.login(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;

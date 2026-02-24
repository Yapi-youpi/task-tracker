import { Router } from 'express';
import * as tasksService from '../services/tasks.service.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const tasks = await tasksService.getTasks(req.user.id);
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.user.id, req.body || {});
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
});

router.patch('/reorder', async (req, res, next) => {
  try {
    const order = req.body?.order;
    if (!Array.isArray(order)) {
      const err = new Error('order array required');
      err.status = 400;
      throw err;
    }
    const result = await tasksService.reorderTasks(req.user.id, order);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(
      req.user.id,
      req.params.id,
      req.body || {}
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.user.id, req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;

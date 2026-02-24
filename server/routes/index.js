import authRoutes from './auth.routes.js';
import tasksRoutes from './tasks.routes.js';

export function mountRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', tasksRoutes);
}

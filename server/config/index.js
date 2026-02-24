export const port = Number(process.env.PORT) || 3000;
export const databaseUrl = process.env.DATABASE_URL;
export const jwtSecret =
  process.env.JWT_SECRET || 'task-tracker-secret-change-in-production';
export const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:4200', 'http://127.0.0.1:4200'];

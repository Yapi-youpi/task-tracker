import express from 'express';
import cors from 'cors';
import { corsOrigins } from './config/index.js';
import { mountRoutes } from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';

const app = express();

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

mountRoutes(app);

app.use(errorMiddleware);

export default app;

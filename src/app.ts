import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: '*', // Allow development frontend origins
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Main API
  app.use('/api', routes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

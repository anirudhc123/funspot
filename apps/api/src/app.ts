import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import apiRouter from './routes';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { securityMiddleware } from './middleware/security';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/csrf';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(cookieParser());

  for (const middleware of securityMiddleware) {
    app.use(middleware);
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(csrfProtection);

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.locals.env = env;

  return app;
};

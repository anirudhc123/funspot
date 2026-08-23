import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  logger.info(
    {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    'request started',
  );

  res.on('finish', () => {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      'request completed',
    );
  });

  next();
};

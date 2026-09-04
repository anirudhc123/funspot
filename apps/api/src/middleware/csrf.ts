import { NextFunction, Request, Response } from 'express';

import { allowedOrigins } from '../config/cors';
import { AppError } from '../errors/AppError';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const csrfProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (!unsafeMethods.has(req.method) || !req.cookies?.accessToken) {
    next();
    return;
  }

  const origin = req.get('origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    next(new AppError(403, 'CSRF_BLOCKED', 'The request origin is not allowed.'));
    return;
  }

  next();
};

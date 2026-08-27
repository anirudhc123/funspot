import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../errors/AppError';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'local-dev-access-secret';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const raw = req.headers.authorization ?? '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : req.cookies?.accessToken;
  if (!token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as { sub: string; email: string; username: string };
    req.user = { id: payload.sub, email: payload.email, username: payload.username };
    return next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token.'));
  }
};

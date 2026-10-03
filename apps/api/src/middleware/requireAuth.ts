import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../errors/AppError';
import { UsersRepository } from '../modules/users/users.repository';
import { env } from '../config/env';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const raw = req.headers.authorization ?? '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : req.cookies?.accessToken;
  if (!token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'funspot',
      audience: 'funspot-api',
      algorithms: ['HS256'],
    });
    if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token subject.');
    }
    const user = await UsersRepository.findById(payload.sub);
    if (!user) return next(new AppError(401, 'UNAUTHORIZED', 'User account was not found.'));
    if (user.status === 'BANNED') return next(new AppError(403, 'ACCOUNT_BANNED', 'This account has been banned.'));
    if (user.status === 'SUSPENDED' && (!user.suspendedUntil || user.suspendedUntil > new Date())) {
      return next(new AppError(403, 'ACCOUNT_SUSPENDED', 'This account is temporarily suspended.'));
    }
    req.user = { id: user.id, email: user.email, username: user.username, role: user.role };
    return next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token.'));
  }
};

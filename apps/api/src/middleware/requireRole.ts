import { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError';
import type { UserRole } from '../modules/users/users.repository';

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const requireRole = (minimumRole: UserRole) => (req: Request, _res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (!role || ROLE_RANK[role] < ROLE_RANK[minimumRole]) {
    return next(new AppError(403, 'INSUFFICIENT_ROLE', 'You are not authorized to perform this action.'));
  }
  return next();
};

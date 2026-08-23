import { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found.`));
};

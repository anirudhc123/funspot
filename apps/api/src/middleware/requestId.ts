import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.get('x-request-id') ?? randomUUID();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

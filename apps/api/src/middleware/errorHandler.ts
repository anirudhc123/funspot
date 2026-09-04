import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';
import { errorResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (res.headersSent) {
    return _next(error);
  }

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Something went wrong.';
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed.';
    details = error.flatten();
  }

  logger.error(
    {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code,
      stack: error instanceof Error ? error.stack : undefined,
    },
    'request failed',
  );

  res.status(statusCode).json(errorResponse(code, message, details));
};

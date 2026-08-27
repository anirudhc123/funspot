import { ZodSchema } from 'zod';

import { AppError } from '../errors/AppError';

export const validate = <T>(schema: ZodSchema<T>, value: unknown, fieldName = 'payload') => {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      `Invalid ${fieldName}.`,
      result.error.flatten(),
    );
  }

  return result.data;
};

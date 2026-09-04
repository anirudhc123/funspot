import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/funspot'),
  JWT_ACCESS_SECRET: z.string().min(32).default('local-development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(32).default('local-development-refresh-secret-change-me'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
}).superRefine((config, context) => {
  if (config.NODE_ENV === 'production') {
    if (config.DATABASE_URL === 'postgresql://postgres:postgres@localhost:5432/funspot') {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['DATABASE_URL'], message: 'Production DATABASE_URL must be explicitly configured.' });
    }
    if (config.JWT_ACCESS_SECRET.includes('local-development') || config.JWT_REFRESH_SECRET.includes('local-development')) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_ACCESS_SECRET'], message: 'Production JWT secrets must be explicitly configured.' });
    }
    if (config.CORS_ORIGIN === '*') {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['CORS_ORIGIN'], message: 'Production CORS_ORIGIN must be an explicit allowlist.' });
    }
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnv.data;

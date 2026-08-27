import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/),
  displayName: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
  password: z.string().min(8).max(128),
}).refine((data) => Boolean(data.email || data.username), {
  message: 'Provide either an email or username.',
  path: ['email'],
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8).max(128),
});

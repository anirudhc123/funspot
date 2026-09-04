import { z } from 'zod';

export const reportSchema = z.object({
  targetType: z.enum(['USER', 'POST', 'COMMENT']),
  targetId: z.string().min(1).max(100),
  reason: z.string().trim().min(3).max(1000).optional(),
});

export const reportUpdateSchema = z.object({
  status: z.enum(['OPEN', 'REVIEWED', 'RESOLVED']),
});

export const userActionSchema = z.object({
  reason: z.string().trim().min(3).max(500).optional(),
  durationHours: z.number().int().positive().max(8760).optional(),
});

export const roleUpdateSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
});

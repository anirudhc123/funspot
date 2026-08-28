import { z } from 'zod';

export const commentSchema = z.object({
  text: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export const shareSchema = z.object({
  text: z.string().max(500).optional(),
});

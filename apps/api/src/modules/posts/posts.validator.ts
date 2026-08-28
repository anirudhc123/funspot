import { z } from 'zod';

export const mediaItemSchema = z.object({
  kind: z.enum(['image', 'video']),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  url: z.string().url().optional(),
  storageKey: z.string().min(1).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().int().positive().optional(),
});

export const createPostSchema = z.object({
  text: z.string().max(5000).optional(),
  location: z.string().max(120).optional(),
  privacy: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC'),
  media: z.array(mediaItemSchema).max(10).default([]),
}).refine((data) => Boolean(data.text?.trim()) || data.media.length > 0, {
  message: 'A post must contain text or media.',
  path: ['text'],
});

export const updatePostSchema = z.object({
  text: z.string().max(5000).optional(),
  location: z.string().max(120).optional(),
  privacy: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).optional(),
  media: z.array(mediaItemSchema).max(10).optional(),
});

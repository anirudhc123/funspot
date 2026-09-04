import { z } from 'zod';

export const usernameSchema = z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/);

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().max(80).optional(),
  privacy: z.enum(['public', 'private', 'followers']).optional(),
});

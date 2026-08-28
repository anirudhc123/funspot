import { z } from 'zod';

export const signedUploadSchema = z.object({
  kind: z.enum(['image', 'video']),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

import { z } from 'zod';

export const createConversationSchema = z.object({
  participants: z.array(z.string().min(1)).min(1, 'At least one participant is required.'),
  name: z.string().min(1).max(120).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content is required.').max(5000),
});

import { z } from 'zod';

export const getMeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type GetMeResponse = z.infer<typeof getMeResponseSchema>;

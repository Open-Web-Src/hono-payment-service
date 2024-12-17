import { z } from 'zod';

export const responseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.any().optional(),
});
export type ApiResponse = z.infer<typeof responseSchema>;

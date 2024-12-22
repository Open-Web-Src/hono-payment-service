import { z } from 'zod'

// Generic pagination response schema
export const paginationResponseSchema = z.object({
  data: z.array(z.any()), // Array of any items; this can be extended for specific schemas
  total: z.number(), // Total number of items
})

// Type inference for reuse
export type PaginationResponse<T> = z.infer<typeof paginationResponseSchema> & { data: T[] }

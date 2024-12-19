import { z } from 'zod'

// Query schema for payment history with pagination
export const paginationQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
})

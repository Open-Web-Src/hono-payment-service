import { z } from 'zod'

// Example for route parameters if applicable
export const paymentIdParamSchema = z.object({
  paymentId: z.string(),
})

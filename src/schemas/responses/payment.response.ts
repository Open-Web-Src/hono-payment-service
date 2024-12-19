import { z } from 'zod'
import { paginationResponseSchema } from '~/schemas'

export const setupIntentResponseSchema = z.object({
  clientSecret: z.string(),
})

export const processPaymentResponseSchema = z.object({
  success: z.boolean(),
  paymentId: z.string(),
})

export const createSubscriptionResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
})

export const paymentMethodsResponseSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    last4: z.string(),
    brand: z.string(),
  }),
)

// Payment history item schema
export const paymentHistoryItemSchema = z.object({
  id: z.string(),
  amount: z.number(),
  status: z.string(),
  created_at: z.string().datetime(),
})

// Extend pagination response schema for payment history
export const paymentHistoryResponseSchema = paginationResponseSchema.extend({
  data: z.array(paymentHistoryItemSchema),
})

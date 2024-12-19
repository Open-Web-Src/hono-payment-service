import { z } from 'zod'

export const processPaymentRequestSchema = z.object({
  amount: z.number(),
  paymentMethodId: z.string(),
})

export const createSubscriptionRequestSchema = z.object({
  amount: z.number(),
  paymentMethodId: z.string(),
})

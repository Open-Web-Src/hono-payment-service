import { z } from 'zod'

export const processPaymentRequestSchema = z.object({
  amount: z.number().min(50, { message: 'Amount must be at least $50.' }).max(50000, { message: 'Amount cannot exceed $50,000.' }),
  paymentMethodId: z.string(),
})

export const createSubscriptionRequestSchema = z.object({
  amount: z.number(),
  paymentMethodId: z.string(),
})

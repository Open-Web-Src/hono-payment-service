import type { RouteConfig } from '@hono/zod-openapi'
import { z } from 'zod'

export function stripeWebhookDoc(path: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    method: 'post',
    path,
    tags: ['Stripe', 'Webhook'],
    summary: 'Handles Stripe webhook events',
    description: 'Processes incoming Stripe webhook events for payments and subscriptions.',
    request: {
      body: {
        content: {
          '*/*': {
            schema: z.any(), // Accept raw payload
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Webhook processed successfully',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string().describe('Success message'),
            }),
          },
        },
      },
    },
  }
}

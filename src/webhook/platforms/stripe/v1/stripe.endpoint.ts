import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { stripeWebhookDoc } from './stripe.docs'
import { stripeWebhookHandler } from './stripe.handler'

const stripeWebhook = new OpenAPIHono()

/**
 * Stripe Webhook Endpoint
 */
stripeWebhook.openapi(
  createRoute(stripeWebhookDoc('/handle')), // Define docs for this route
  async c => {
    try {
      // Delegate to the handler, which includes Stripe verification
      return await stripeWebhookHandler(c)
    } catch (error) {
      console.error('Error processing Stripe webhook:', error)
      return c.json({ error: 'Failed to process webhook' }, 500)
    }
  },
)

export default stripeWebhook

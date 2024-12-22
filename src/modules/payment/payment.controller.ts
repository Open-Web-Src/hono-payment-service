import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { StripeService } from './stripe.service'
import { PaymentService } from './payment.service'
import {
  createSetupIntentDocs,
  processPaymentDocs,
  createSubscriptionDocs,
  getPaymentMethodsDocs,
  getPaymentHistoryDocs,
  downloadInvoiceDocs,
  unlinkPaymentMethodDocs,
} from './payment.docs'

const app = new OpenAPIHono()

/**
 * Create a SetupIntent for linking a payment method
 */
app.openapi(createRoute(createSetupIntentDocs('/setup-intent')), async c => {
  const userId = c.get('user')?.id

  const stripeService = new StripeService(c)
  const response = await stripeService.createSetupIntent(userId!)

  return c.json(response, 200)
})

/**
 * Process a one-time payment
 */
app.openapi(createRoute(processPaymentDocs('/process-payment')), async c => {
  const { amount, paymentMethodId } = await c.req.json()
  const userId = c.get('user')?.id

  const stripeService = new StripeService(c)
  const response = await stripeService.processOneTimePayment(userId!, parseFloat(amount), paymentMethodId)

  return c.json(response, 200)
})

/**
 * Create a fixed-price subscription
 */
app.openapi(createRoute(createSubscriptionDocs('/create-subscription')), async c => {
  const { amount, paymentMethodId } = await c.req.json()
  const userId = c.get('user')?.id

  const stripeService = new StripeService(c)
  const response = await stripeService.createFixedPriceSubscription(userId!, parseFloat(amount), paymentMethodId)

  return c.json(response, 200)
})

/**
 * List payment methods for a user
 */
app.openapi(createRoute(getPaymentMethodsDocs('/payment-methods')), async c => {
  const userId = c.get('user')?.id

  const paymentService = new PaymentService(c)
  const methods = await paymentService.getPaymentMethods(userId!)

  return c.json(methods, 200)
})

/**
 * Get payment history for a user
 */
app.openapi(createRoute(getPaymentHistoryDocs('/payment-history')), async c => {
  const userId = c.get('user')?.id
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = parseInt(c.req.query('limit') || '10', 10)

  const paymentService = new PaymentService(c)
  const history = await paymentService.getPaymentHistory(userId!, page, limit)

  return c.json(history, 200)
})

app.openapi(createRoute(downloadInvoiceDocs('/download-invoice/:invoiceId')), async c => {
  const invoiceId = c.req.param('invoiceId')

  const stripeService = new StripeService(c)
  try {
    const invoicePdfUrl = await stripeService.downloadInvoice(invoiceId!)
    return c.json({ invoicePdfUrl }, 200)
  } catch (error: any) {
    console.error(`Failed to download invoice: ${error.message}`)
    return c.json({ error: error.message }, 500)
  }
})

app.openapi(createRoute(unlinkPaymentMethodDocs('/unlink-payment-method')), async c => {
  const { paymentMethodId } = await c.req.json()
  const userId = c.get('user')?.id

  const stripeService = new StripeService(c)

  try {
    const response = await stripeService.unlinkPaymentMethod(userId!, paymentMethodId)
    return c.json(response, 200)
  } catch (error: any) {
    console.error(`Failed to unlink payment method: ${error.message}`)
    return c.json({ error: error.message }, 500)
  }
})

export default app

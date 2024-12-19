import Stripe from 'stripe'
import { Context, Env } from 'hono'
import { PaymentService, UserService } from '~/modules/index-service'

export async function stripeWebhookHandler(c: Context<Env>) {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()

  try {
    const event = await stripe.webhooks.constructEventAsync(body, sig || '', c.env.STRIPE_WEBHOOK_SECRET_KEY)

    console.log('Event:', event)

    switch (event.type) {
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event, c)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return c.json({ received: true }, 200)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return c.json({ error: 'Webhook signature verification failed' }, 400)
  }
}

// Handle Setup Intent Succeeded
async function handleSetupIntentSucceeded(event: Stripe.Event, c: Context<Env>) {
  const setupIntent = event.data.object as Stripe.SetupIntent
  const { payment_method, customer } = setupIntent

  if (!payment_method || typeof payment_method !== 'string') {
    console.error('No payment method available in the SetupIntent.')
    return
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)

  // Retrieve the payment method details
  const paymentMethod = await stripe.paymentMethods.retrieve(payment_method)

  const paymentService = new PaymentService(c)
  const userService = new UserService(c)

  try {
    if (paymentMethod.card) {
      // Find the user by customer ID
      const user = await userService.getUserByStripeCustomerId(customer as string)

      // Safely store the payment method in the database
      await paymentService.storePaymentMethod(user.id, {
        paymentMethodId: paymentMethod.id,
        type: paymentMethod.type || 'unknown',
        last4: paymentMethod.card.last4 || 'unknown',
        brand: paymentMethod.card.brand || 'unknown',
        expMonth: paymentMethod.card.exp_month || null,
        expYear: paymentMethod.card.exp_year || null,
        cardholderName: paymentMethod.billing_details?.name || 'unknown',
      })

      console.log(`Payment method saved for user: ${user.id}`)
    } else {
      console.error('Payment method does not contain card details.')
    }
  } catch (error: any) {
    console.error(`Failed to process setup_intent.succeeded event: ${error.message}`)
  }
}

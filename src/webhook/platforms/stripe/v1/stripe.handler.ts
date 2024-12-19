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

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event, c)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event, c)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, c)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, c)
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
      })

      console.log(`Payment method saved for user: ${user.id}`)
    } else {
      console.error('Payment method does not contain card details.')
    }
  } catch (error: any) {
    console.error(`Failed to process setup_intent.succeeded event: ${error.message}`)
  }
}

// Handle Payment Intent Succeeded
async function handlePaymentIntentSucceeded(event: Stripe.Event, c: Context<Env>) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const { id, amount, customer, status } = paymentIntent

  const paymentService = new PaymentService(c)

  // Store the payment record
  await paymentService.storePayment(customer as string, id, amount / 100, status)

  console.log(`PaymentIntent ${id} succeeded.`)
}

// Handle Invoice Payment Succeeded
async function handleInvoicePaymentSucceeded(event: Stripe.Event, c: Context<Env>) {
  const invoice = event.data.object as Stripe.Invoice
  const subscriptionId = invoice.subscription as string
  const { customer, amount_paid } = invoice

  const paymentService = new PaymentService(c)

  // Update subscription status to active
  await paymentService.updateSubscriptionStatus(subscriptionId, 'active')

  console.log(`Invoice for customer ${customer} succeeded, amount paid: ${amount_paid}`)
}

// Handle Subscription Updated

async function handleSubscriptionUpdated(event: Stripe.Event, c: Context<Env>) {
  const subscription = event.data.object as Stripe.Subscription
  const { id, status } = subscription

  const paymentService = new PaymentService(c)

  // Update subscription status
  await paymentService.updateSubscriptionStatus(id, status)

  console.log(`Subscription ${id} updated to status ${status}`)
}

// Handle Subscription Deleted

async function handleSubscriptionDeleted(event: Stripe.Event, c: Context<Env>) {
  const subscription = event.data.object as Stripe.Subscription
  const { id } = subscription

  const paymentService = new PaymentService(c)

  // Mark subscription as canceled
  await paymentService.updateSubscriptionStatus(id, 'canceled')

  console.log(`Subscription ${id} canceled.`)
}

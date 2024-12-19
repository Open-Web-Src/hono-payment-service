import Stripe from 'stripe'
import { Context, Env } from 'hono'
import { UserService, PaymentService } from '~/modules/index-service'
import { BadRequestException } from '~/exceptions'

export class StripeService {
  private readonly stripe: Stripe
  private readonly paymentService: PaymentService
  private readonly userService: UserService

  constructor(private readonly context: Context<Env>) {
    this.stripe = new Stripe(context.env.STRIPE_SECRET_KEY)
    this.paymentService = new PaymentService(context)
    this.userService = new UserService(context)
  }

  /**
   * Create a SetupIntent for linking a payment method
   */
  async createSetupIntent(userId: string) {
    const customer = await this.getOrCreateCustomer(userId)
    if (!customer.stripe_customer_id) {
      throw new BadRequestException('Customer Stripe ID is null or undefined')
    }
    const setupIntent = await this.stripe.setupIntents.create({ customer: customer.stripe_customer_id })
    return { clientSecret: setupIntent.client_secret }
  }

  /**
   * Retrieve a payment method from Stripe
   */
  async getPaymentMethod(paymentMethodId: string) {
    return await this.stripe.paymentMethods.retrieve(paymentMethodId)
  }

  /**
   * Process a one-time payment and store it
   */
  async processOneTimePayment(userId: string, amountInDollars: number, paymentMethodId: string) {
    const customer = await this.getOrCreateCustomer(userId)

    if (!customer.stripe_customer_id) {
      throw new BadRequestException('Customer Stripe ID is null or undefined')
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      customer: customer.stripe_customer_id,
      amount: amountInDollars * 100, // Convert dollars to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    })

    // Store the payment record using PaymentService
    await this.paymentService.storePayment(userId, paymentIntent.id, amountInDollars, paymentIntent.status)

    return { success: true, paymentId: paymentIntent.id }
    // return {}
  }

  /**
   * Create a fixed-price subscription
   */
  async createFixedPriceSubscription(userId: string, amountInDollars: number, paymentMethodId: string) {
    const customer = await this.getOrCreateCustomer(userId)

    if (!customer.stripe_customer_id) {
      throw new BadRequestException('Customer Stripe ID is null or undefined')
    }

    const price = await this.stripe.prices.create({
      unit_amount: amountInDollars * 100,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: { name: `Fixed Subscription - $${amountInDollars}/month` },
    })

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.stripe_customer_id,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
    })

    // Store the subscription using PaymentService
    await this.paymentService.storeSubscription(userId, subscription.id, price.id, subscription.status)

    return subscription
    // return {}
  }

  /**
   * Create a usage-based subscription
   */
  async createUsageBasedSubscription(userId: string, unitAmount: number, paymentMethodId: string) {
    const customer = await this.getOrCreateCustomer(userId)

    if (!customer.stripe_customer_id) {
      throw new BadRequestException('Customer Stripe ID is null or undefined')
    }

    const price = await this.stripe.prices.create({
      unit_amount: unitAmount * 100,
      currency: 'usd',
      recurring: { interval: 'month', usage_type: 'metered' },
      product_data: { name: `Usage-Based Subscription - $${unitAmount}/unit` },
    })

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.stripe_customer_id,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
    })

    // Store the subscription using PaymentService
    await this.paymentService.storeSubscription(userId, subscription.id, price.id, subscription.status)

    return subscription
    // return {}
  }

  /**
   * Get or create a Stripe customer
   */
  private async getOrCreateCustomer(userId: string) {
    const user = await this.userService.getUserByIdOrEmail(userId)

    if (!user.stripe_customer_id) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
      } as Stripe.CustomerCreateParams)

      await this.userService.updateUser(userId, { stripe_customer_id: customer.id })

      return { stripe_customer_id: customer.id }
    }

    return user
  }
}

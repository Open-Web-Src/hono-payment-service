import Stripe from 'stripe'
import { Context, Env } from 'hono'
import { UserService, PaymentService, WalletService } from '~/modules/index-service'
import { BadRequestException } from '~/exceptions'

export class StripeService {
  private readonly stripe: Stripe
  private readonly paymentService: PaymentService
  private readonly userService: UserService
  private readonly walletService: WalletService

  constructor(private readonly context: Context<Env>) {
    this.stripe = new Stripe(context.env.STRIPE_SECRET_KEY)
    this.paymentService = new PaymentService(context)
    this.userService = new UserService(context)
    this.walletService = new WalletService(context)
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
    const customer = await this.userService.getUserByIdOrEmail(userId)

    if (!customer.stripe_customer_id) {
      throw new BadRequestException('Customer Stripe ID is null or undefined')
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      customer: customer.stripe_customer_id,
      amount: amountInDollars * 100, // Convert dollars to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirms the payment
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Ensures no redirection-based methods are used
      },
    })

    // Create an invoice for the payment
    const invoiceId = await this.createInvoiceForPayment(customer.stripe_customer_id, paymentIntent.id, amountInDollars)

    // Store the payment record
    await this.paymentService.storePayment(userId, paymentIntent.id, amountInDollars, paymentIntent.status, invoiceId, paymentMethodId)

    // Increase user wallet balance
    await this.walletService.increaseBalance(userId, amountInDollars)

    return { success: true, paymentId: paymentIntent.id }
  }

  private async createInvoiceForPayment(customerId: string, paymentIntentId: string, amountInDollars: number): Promise<string> {
    // Step 1: Create an InvoiceItem associated with the customer
    await this.stripe.invoiceItems.create({
      customer: customerId,
      amount: amountInDollars * 100,
      currency: 'usd',
      description: 'One-time payment charge',
    })

    // Step 2: Create an Invoice associated with the InvoiceItem
    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically', // Automatically charge the customer
      auto_advance: true, // Automatically finalize the invoice after creation
      metadata: {
        payment_intent_id: paymentIntentId, // Associate the PaymentIntent with the Invoice
      },
      pending_invoice_items_behavior: 'include',
    })

    // Step 3: Finalize the Invoice
    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id)

    // Ensure the finalized invoice has an available PDF
    if (!finalizedInvoice.invoice_pdf) {
      throw new Error('Invoice PDF not available for the specified invoice.')
    }

    return finalizedInvoice.id // Return the finalized invoice ID
  }

  /**
   * Create a fixed-price subscription
   */
  async createFixedPriceSubscription(userId: string, amountInDollars: number, paymentMethodId: string) {
    const customer = await this.userService.getUserByIdOrEmail(userId)

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
    const customer = await this.userService.getUserByIdOrEmail(userId)

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
   * Download an invoice as a PDF
   */
  async downloadInvoice(invoiceId: string): Promise<string> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId)

      if (!invoice.invoice_pdf) {
        throw new Error('Invoice PDF not available for the specified invoice.')
      }

      return invoice.invoice_pdf // This URL points to the PDF hosted by Stripe
    } catch (error: any) {
      console.error(`Failed to retrieve invoice: ${error.message}`)
      throw new Error('Unable to download invoice. Please try again later.')
    }
  }
}

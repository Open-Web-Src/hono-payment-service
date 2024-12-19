import { Context, Env } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { paymentMethods, payments, subscriptions } from '~/database'

export class PaymentService {
  private readonly db: DrizzleDatabase

  constructor(private readonly context: Context<Env>) {
    this.db = context.get('db')
  }

  /**
   * List user's payment methods
   */
  async getPaymentMethods(userId: string) {
    return await this.db.query.paymentMethods.findMany({
      where: eq(paymentMethods.user_id, userId),
      orderBy: (table, { asc }) => asc(table.created_at), // Sort by ascending `created_at`
    })
  }

  /**
   * Retrieve payment history with pagination
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    // Fetch paginated data
    const data = await this.db.query.payments.findMany({
      where: eq(payments.user_id, userId),
      orderBy: (table, { desc }) => desc(table.created_at),
      limit,
      offset: (page - 1) * limit,
    })

    // Fetch total count using aggregation
    const totalResult = await this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(payments)
      .where(eq(payments.user_id, userId))

    const total = totalResult[0]?.total ?? 0

    return { data, total }
  }

  /**
   * Store a new payment method for a user
   */
  async storePaymentMethod(
    userId: string,
    data: {
      paymentMethodId: string
      type: string
      last4: string
      brand: string
    },
  ) {
    await this.db.insert(paymentMethods).values({
      id: data.paymentMethodId,
      user_id: userId,
      stripe_payment_method_id: data.paymentMethodId,
      type: data.type,
      last4: data.last4,
      brand: data.brand,
    })
  }

  /**
   * Store a payment record
   */
  async storePayment(userId: string, paymentId: string, amount: number, status: string) {
    await this.db.insert(payments).values({
      id: paymentId,
      user_id: userId,
      amount,
      stripe_payment_id: paymentId,
      status,
    })
  }

  /**
   * Store a subscription record
   */
  async storeSubscription(userId: string, subscriptionId: string, priceId: string, status: string) {
    await this.db.insert(subscriptions).values({
      id: subscriptionId,
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      price_id: priceId,
      status,
    })
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    await this.db.update(subscriptions).set({ status }).where(eq(subscriptions.stripe_subscription_id, subscriptionId))
  }
}

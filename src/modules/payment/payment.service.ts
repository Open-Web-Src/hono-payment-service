import { Context, Env } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { paymentMethods, payments, subscriptions } from '~/database'

export class PaymentService {
  private readonly db: DrizzleDatabase

  constructor(private readonly context: Context<Env>) {
    this.db = context.get('db')
  }

  /**
   * Retrieve a specific payment method for a user
   */
  async getPaymentMethod(userId: string, paymentMethodId: string) {
    return await this.db.query.paymentMethods.findFirst({
      where: table => and(eq(table.user_id, userId), eq(table.id, paymentMethodId)),
    })
  }

  /**
   * Retrieve all payment methods for a user (with optional filters)
   */
  async getPaymentMethods(userId: string, filters: { type?: string; brand?: string } = {}) {
    const conditions = [
      eq(paymentMethods.user_id, userId),
      filters.type ? eq(paymentMethods.type, filters.type) : undefined,
      filters.brand ? eq(paymentMethods.brand, filters.brand) : undefined,
      sql`deleted_at IS NULL`,
    ].filter(Boolean)

    return await this.db.query.paymentMethods.findMany({
      where: and(...conditions),
      orderBy: (table, { asc }) => asc(table.created_at),
    })
  }

  /**
   * Retrieve payment history with associated payment method brand using INNER JOIN
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    // Fetch payment history joined with payment method brand
    const data = await this.db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        invoice_id: payments.invoice_id,
        created_at: payments.created_at,
        type: payments.type,
        brand: paymentMethods.brand, // Include only brand from paymentMethods
      })
      .from(payments)
      .innerJoin(paymentMethods, eq(payments.payment_method_id, paymentMethods.id)) // Inner join on payment_method_id
      .where(eq(payments.user_id, userId))
      .orderBy(sql`${payments.created_at} DESC`) // Order by created_at descending
      .limit(limit)
      .offset((page - 1) * limit)

    // Fetch total count of records for pagination
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
      expMonth?: number | null
      expYear?: number | null
      cardholderName?: string
    },
  ) {
    await this.db.insert(paymentMethods).values({
      id: data.paymentMethodId,
      user_id: userId,
      stripe_payment_method_id: data.paymentMethodId,
      type: data.type,
      last4: data.last4,
      brand: data.brand,
      exp_month: data.expMonth || null,
      exp_year: data.expYear || null,
      cardholder_name: data.cardholderName || null,
    })
  }

  /**
   * Store a payment record
   */
  async storePayment(
    userId: string,
    paymentId: string,
    amount: number,
    status: string,
    invoiceId?: string,
    paymentMethodId?: string, // Optional payment method ID
    type: string = 'top-up',
  ) {
    await this.db.insert(payments).values({
      id: paymentId,
      user_id: userId,
      amount,
      stripe_payment_id: paymentId,
      invoice_id: invoiceId ?? '',
      payment_method_id: paymentMethodId ?? null, // Add payment method ID
      status,
      type,
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

  /**
   * Soft delete a payment method by updating `deleted_at`
   */
  async softDeletePaymentMethod(userId: string, paymentMethodId: string) {
    await this.db
      .update(paymentMethods)
      .set({ deleted_at: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))` })
      .where(and(eq(paymentMethods.user_id, userId), eq(paymentMethods.id, paymentMethodId)))
  }
}

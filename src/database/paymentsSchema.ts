import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'
import { sql } from 'drizzle-orm'
import { paymentMethods } from './paymentMethodsSchema'

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  stripe_payment_id: text('stripe_payment_id').notNull(),
  invoice_id: text('invoice_id').default(''),
  payment_method_id: text('payment_method_id').references(() => paymentMethods.id),
  type: text('type').default('top-up').notNull(),
  status: text('status').notNull(),
  created_at: text('created_at', { mode: 'text' })
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(), // Timestamp of when the user was created
})

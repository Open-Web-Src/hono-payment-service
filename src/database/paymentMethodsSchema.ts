import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'
import { sql } from 'drizzle-orm'

export const paymentMethods = sqliteTable('payment_methods', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  stripe_payment_method_id: text('stripe_payment_method_id').unique().notNull(),
  type: text('type').notNull(),
  last4: text('last4'),
  brand: text('brand'),
  created_at: text('created_at', { mode: 'text' })
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(), // Timestamp of when the user was created
})

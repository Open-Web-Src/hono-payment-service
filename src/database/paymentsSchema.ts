import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'
import { sql } from 'drizzle-orm'

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  stripe_payment_id: text('stripe_payment_id').notNull().unique(),
  status: text('status').notNull(),
  created_at: text('created_at', { mode: 'text' })
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(), // Timestamp of when the user was created
})

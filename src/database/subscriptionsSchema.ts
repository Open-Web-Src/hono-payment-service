import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'
import { sql } from 'drizzle-orm'

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  stripe_subscription_id: text('stripe_subscription_id').notNull().unique(),
  price_id: text('price_id').notNull(),
  status: text('status').notNull(),
  created_at: text('created_at', { mode: 'text' })
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(), // Timestamp of when the user was created
})

import { sqliteTable, text, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './userSchema'

export const userWallets = sqliteTable(
  'user_wallets',
  {
    id: text('id').primaryKey(), // Unique wallet identifier
    user_id: text('user_id')
      .notNull()
      .references(() => users.id), // Foreign key referencing the users table
    balance: real('balance').default(0).notNull(), // Current wallet balance in dollars
    created_at: text('created_at', { mode: 'text' })
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
      .notNull(), // Timestamp of when the wallet was created
    updated_at: text('updated_at', { mode: 'text' })
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
      .notNull(), // Timestamp of the last wallet update
  },
  table => ({
    userWalletIdx: uniqueIndex('user_wallet_idx').on(table.user_id), // Ensure each user has only one wallet
  }),
)

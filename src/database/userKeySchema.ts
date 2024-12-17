import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'

export const userKeys = sqliteTable('user_keys', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  hashed_password: text('hashed_password').notNull(),
  salt: text('salt').notNull(),
})

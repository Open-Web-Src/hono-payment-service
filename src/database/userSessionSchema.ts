import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './userSchema'

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').notNull().primaryKey(), // Unique identifier for each session
  user_id: text('user_id')
    .notNull()
    .references(() => users.id), // Foreign key referencing the user
  expires_at: text('expires_at') // Timestamp of when the session expires in ISO 8601 format
    .notNull(),
})

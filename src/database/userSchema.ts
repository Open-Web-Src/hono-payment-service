import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    created_at: text('created_at', { mode: 'text' })
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
      .notNull(), // Timestamp of when the user was created
    updated_at: text('updated_at', { mode: 'text' })
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
      .notNull(), // Timestamp of when the user was last updated
    deleted_at: text('deleted_at', { mode: 'text' }), // Optional, can be null
    email: text('email').unique(),
    picture: text('picture'),
    name: text('name'),
  },
  table => ({
    userEmailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
)

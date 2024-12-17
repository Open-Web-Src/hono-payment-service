import { relations } from 'drizzle-orm'
import { users } from './userSchema'
import { userKeys } from './userKeySchema'
import { userSessions } from './userSessionSchema'

// User Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  key: one(userKeys),
  sessions: many(userSessions),
}))

// User Key Relations
export const userKeysRelations = relations(userKeys, ({ one }) => ({
  user: one(users, {
    fields: [userKeys.user_id],
    references: [users.id],
  }),
}))

// User Session Relations
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.user_id],
    references: [users.id],
  }),
}))

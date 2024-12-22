import { relations } from 'drizzle-orm'
import { users } from './userSchema'
import { userKeys } from './userKeySchema'
import { userSessions } from './userSessionSchema'
import { payments } from './paymentsSchema'
import { paymentMethods } from './paymentMethodsSchema'
import { subscriptions } from './subscriptionsSchema'

// User Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  key: one(userKeys),
  sessions: many(userSessions),
  paymentMethods: many(paymentMethods),
  payments: many(payments),
  subcription: one(subscriptions),
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

// Payment Relations
export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.user_id],
    references: [users.id],
  }),
}))
export const paymentMethodRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.user_id],
    references: [users.id],
  }),
}))
export const paymentSubcriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}))

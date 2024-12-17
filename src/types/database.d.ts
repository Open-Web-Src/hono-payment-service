import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '~/database'
import type { users } from '~/database'

declare global {
  type SchemaType = typeof schema
  type DrizzleDatabase = DrizzleD1Database<SchemaType>

  type User = typeof users.$inferSelect
  type NewUser = typeof users.$inferInsert

  type UserWithRelations = User
}

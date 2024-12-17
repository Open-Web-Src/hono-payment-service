import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { Session } from 'lucia'

declare module 'hono' {
  type Variables = {
    session: Session | null
    user: UserWithRelations | null
    db: DrizzleD1Database<SchemaType>
    lucia: LuciaUserType
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Bindings extends CloudflareBindings {
    // Add any additional bindings here if needed
  }

  interface Env {
    Variables: Variables
    Bindings: Bindings
  }
}

declare module 'lucia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DatabaseSessionAttributes {}

  interface DatabaseUserAttributes {
    role: string
    id: string
    email: string
  }

  interface Register {
    Lucia: LuciaUserType
    DatabaseSessionAttributes: DatabaseSessionAttributes
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

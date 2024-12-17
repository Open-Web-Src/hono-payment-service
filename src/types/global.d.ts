import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { Session } from 'lucia';

declare module 'hono' {
  // eslint-disable-next-line ts/consistent-type-definitions
  type Variables = {
    session: Session | null;
    user: UserWithRelations | null;
    db: DrizzleD1Database<SchemaType>;
    lucia: LuciaUserType;
  };

  // eslint-disable-next-line ts/consistent-type-definitions
  interface Bindings extends CloudflareBindings {
    // Add any additional bindings here if needed
  }

  interface Env {
    Variables: Variables;
    Bindings: Bindings;
  }
}

declare module 'lucia' {
  interface DatabaseSessionAttributes {}

  interface DatabaseUserAttributes {
    role: string;
    id: string;
    email: string;
  }

  interface Register {
    Lucia: LuciaUserType;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

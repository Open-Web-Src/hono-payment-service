import { drizzle } from 'drizzle-orm/d1'
import type { Bindings } from 'hono'
import * as schema from '~/database'

export function createDbClient(env: Bindings): DrizzleDatabase {
  if (!env.DB) {
    throw new Error('DB binding is missing in environment variables')
  }

  return drizzle(env.DB, { logger: false, schema })
}

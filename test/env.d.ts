import type { Bindings } from 'hono'

declare module 'cloudflare:test' {
  // Controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Bindings {
    TEST_MIGRATIONS: D1Migration[] // Defined in `vitest.config.ts`
  }
}

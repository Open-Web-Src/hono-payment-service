import type { Context, Env, MiddlewareHandler } from 'hono'
import { initializeLuciaUser } from '~/utils'

export function setupLucia(): MiddlewareHandler {
  return async (c: Context<Env>, next) => {
    const lucia: LuciaUserType = initializeLuciaUser(c.env)
    c.set('lucia', lucia)
    await next()
  }
}

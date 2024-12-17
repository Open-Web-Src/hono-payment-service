import type { Context, Env, MiddlewareHandler } from 'hono';
import { createDbClient } from '~/utils';

export function setupDb(): MiddlewareHandler {
  return async (c: Context<Env>, next) => {
    const db = createDbClient(c.env);
    c.set('db', db);
    await next();
  };
}

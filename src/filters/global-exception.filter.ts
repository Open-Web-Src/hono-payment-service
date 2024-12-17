import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';

export function globalExceptionsFilter(err: unknown, c: Context) {
  if (err instanceof ZodError) {
    return c.json({ message: err.message }, 400);
  }

  if (err instanceof HTTPException) {
    if (err.status >= 500) {
      console.error('Server Error:', err);
    }
    return c.json({ message: err.message }, err.status);
  }

  console.error('Unexpected Error:', err);
  return c.json({ message: 'Internal Server Error' }, 500);
}

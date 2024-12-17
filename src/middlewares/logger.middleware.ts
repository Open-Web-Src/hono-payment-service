import type { Context, Env, MiddlewareHandler } from 'hono';

export function requestLogger(): MiddlewareHandler<Env> {
  return async (c: Context<Env>, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    const method = c.req.method;
    const url = c.req.url;
    const status = c.res.status;

    const log = {
      method,
      url,
      status,
      duration: `${duration}ms`,
    };

    // Environment-based logging (skip in production)
    if (c.env.ENVIRONMENT !== 'production') {
      console.log(JSON.stringify(log));
    }

    // Additional logging for errors
    if (status >= 400) {
      const errorLog: any = { ...log, headers: filterHeaders(c.req.header()) };

      try {
        errorLog.body = await c.req.json();
      } catch (e) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        errorLog.bodyError = 'Failed to parse request body';
      }

      console.error(JSON.stringify(errorLog));
    }
  };
}

// Utility function to filter out sensitive headers
function filterHeaders(
  headers: Record<string, string | string[]>
): Record<string, string | string[]> {
  const sensitiveHeaders = ['authorization', 'cookie'];
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([key]) => !sensitiveHeaders.includes(key.toLowerCase())
    )
  );
}

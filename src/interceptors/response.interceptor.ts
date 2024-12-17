import type { Context, Env, MiddlewareHandler } from 'hono';
import { responseSchema } from '~/schemas';

// Middleware to enforce response structure for successful responses
export function responseInterceptor(): MiddlewareHandler<Env> {
  return async (c: Context<Env>, next) => {
    // Skip interceptor for specific paths
    const skipPaths = [
      '/docs',
      '/openapi.json',
      'jpg',
      'jpeg',
      'png',
      'mp4',
      'mov',
      'csv',
    ];
    if (skipPaths.some((path) => c.req.path.endsWith(path))) {
      return next();
    }

    // Execute the next middleware or route handler
    await next();

    // Check for binary content types (e.g., video and CSV)
    const contentType = c.res.headers.get('Content-Type');
    if (
      contentType &&
      (contentType.startsWith('video/') ||
        contentType.startsWith('image/') ||
        contentType === 'text/csv')
    ) {
      return; // Skip formatting for binary types
    }

    // Capture the response body
    let responseBody: any = c.res.body;

    // Check if the response body is a ReadableStream
    if (responseBody instanceof ReadableStream) {
      const reader = responseBody.getReader();
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          result += new TextDecoder().decode(value);
        }
      }
      try {
        responseBody = JSON.parse(result);
      } catch (error) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        responseBody = { message: result };
      }
    }

    // Determine the message based on status or response data
    let message = '';
    if (c.res.status >= 200 && c.res.status < 300) {
      message = (responseBody as any)?.message || 'Success';
    } else if (c.res.status >= 400 && c.res.status < 500) {
      message = (responseBody as any)?.message || 'Client error';
    } else if (c.res.status >= 500) {
      message = (responseBody as any)?.message || 'Server error';
    } else {
      message = (responseBody as any)?.message || 'Response received';
    }

    // Create the standardized response
    const formattedResponse = {
      statusCode: c.res.status,
      message, // Use the dynamic message here
      data: responseBody,
    };

    // Validate the response against the schema
    const validatedResponse = responseSchema.parse(formattedResponse);

    // Create a new response with the validated data
    const headers = new Headers(c.res.headers);
    // Only set Content-Type if it doesn't already exist
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Replace the response with the new structured response
    c.res = new Response(JSON.stringify(validatedResponse), {
      status: c.res.status,
      headers, // Use modified headers
    });
  };
}

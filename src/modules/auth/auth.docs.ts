import type { RouteConfig } from '@hono/zod-openapi'
import { enforceUserBearerToken } from '~/middlewares'
import { registerRequestSchema, loginRequestSchema, registerResponseSchema, loginResponseSchema, logoutResponseSchema } from '~/schemas'

// Register Creator API Documentation
export function registerRouteDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Register a new creator',
    method: 'post',
    tags: ['Authentication'],
    path: route,
    request: {
      body: {
        content: {
          'application/json': { schema: registerRequestSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'User successfully registered',
        content: {
          'application/json': {
            schema: registerResponseSchema,
          },
        },
      },
    },
  }
}

// Login User API Documentation
export function loginRouteDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Login a user',
    method: 'post',
    tags: ['Authentication'],
    path: route,
    request: {
      body: {
        content: {
          'application/json': { schema: loginRequestSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'User successfully logged in',
        content: {
          'application/json': {
            schema: loginResponseSchema,
          },
        },
      },
    },
  }
}

// Logout User API Documentation
export function logoutRouteDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Logout user',
    method: 'post',
    tags: ['Authentication'],
    middleware: [enforceUserBearerToken()],
    path: route,
    responses: {
      200: {
        description: 'User successfully logged out',
        content: {
          'application/json': {
            schema: logoutResponseSchema,
          },
        },
      },
    },
  }
}

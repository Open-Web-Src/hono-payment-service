import { z, type RouteConfig } from '@hono/zod-openapi'
import { enforceUserBearerToken } from '~/middlewares'
import { getMeResponseSchema } from '~/schemas'

export function getMeRouteDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Get authenticated user details',
    method: 'get',
    tags: ['User'],
    middleware: [enforceUserBearerToken()],
    path: route,
    responses: {
      200: {
        description: 'Authenticated user details retrieved successfully',
        content: {
          'application/json': {
            schema: getMeResponseSchema,
          },
        },
      },
    },
  }
}

export function getUserWalletDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Get the authenticated user wallet details',
    method: 'get',
    tags: ['Wallet'],
    middleware: [enforceUserBearerToken()],
    path: route,
    responses: {
      200: {
        description: 'Wallet details',
        content: {
          'application/json': {
            schema: z.object({
              wallet: z.object({
                id: z.string(),
                user_id: z.string(),
                balance: z.number(),
              }),
            }),
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
      },
    },
  }
}

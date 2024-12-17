import type { RouteConfig } from '@hono/zod-openapi'
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

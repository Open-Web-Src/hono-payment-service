import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getMeRouteDocs } from './user.docs'

const app = new OpenAPIHono()

/**
 * Get the authenticated user's details
 */
app.openapi(createRoute(getMeRouteDocs('/me')), async c => {
  // User details are already fetched by the middleware
  const user = c.get('user')

  // Respond with the authenticated user's details
  return c.json({ user }, 200)
})

export default app

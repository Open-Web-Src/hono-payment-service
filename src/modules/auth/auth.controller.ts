import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { registerRouteDocs, loginRouteDocs, logoutRouteDocs } from './auth.docs'
import { AuthService } from './auth.service'
import { AuthorizationException } from '~/exceptions'

const app = new OpenAPIHono()

/**
 * Register a new user
 */
app.openapi(createRoute(registerRouteDocs('/register')), async c => {
  const payload = c.req.valid('json')
  const authService = new AuthService(c)

  const registeredUser = await authService.register(payload)

  return c.json(registeredUser, 200)
})

/**
 * Login a user
 */
app.openapi(createRoute(loginRouteDocs('/login')), async c => {
  const payload = c.req.valid('json')
  const authService = new AuthService(c)

  const loginResponse = await authService.login(payload)

  return c.json(loginResponse, 200)
})

/**
 * Logout a user
 */
app.openapi(createRoute(logoutRouteDocs('/logout')), async c => {
  const lucia = c.get('lucia')
  const authorizationHeader = c.req.header('Authorization')
  const sessionId = lucia.readBearerToken(authorizationHeader ?? '')
  if (!sessionId) {
    throw new AuthorizationException('Missing or invalid Authorization header')
  }
  const authService = new AuthService(c)
  const logoutResponse = await authService.logout(sessionId)

  return c.json(logoutResponse, 200)
})

export default app

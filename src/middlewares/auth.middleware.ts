import type { Context, Env, MiddlewareHandler, Next } from 'hono'
import { parse } from 'cookie'
import { UserService } from '~/modules/index-service'
import { AuthorizationException } from '~/exceptions'

/**
 * Middleware to enforce user authentication using Bearer Token (session ID).
 * Validates the session using the session ID passed as a Bearer Token.
 * Note: This middleware does not extend or renew the session.
 * It only validates the existing session.
 */
export function enforceUserBearerToken(): MiddlewareHandler {
  return async (c: Context<Env>, next: Next) => {
    const lucia = c.get('lucia')
    const authorizationHeader = c.req.header('Authorization')
    const sessionId = lucia.readBearerToken(authorizationHeader ?? '')

    if (!sessionId) {
      throw new AuthorizationException('Missing or invalid Authorization header')
    }

    const { session, user } = await lucia.validateSession(sessionId)
    if (!session) {
      throw new AuthorizationException('Missing or invalid Authorization header')
    }

    const userService = new UserService(c)
    const userWithRelation = await userService.getUserByIdOrEmail(user.id) // Fetch additional details
    if (!userWithRelation) {
      throw new AuthorizationException('Missing or invalid Authorization header')
    }

    // Attach the session and user to the context
    c.set('session', session)
    c.set('user', userWithRelation)

    await next()
  }
}

/**
 * Middleware to enforce user authentication using a session ID stored in a cookie.
 * Validates the session using the session ID from the cookie.
 * This middleware can optionally extend the session if it's close to expiry.
 */
export function enforceUserSessionCookie(): MiddlewareHandler<Env> {
  return async (c: Context<Env>, next: Next) => {
    const lucia = c.get('lucia')

    // Parse cookies from the header
    const cookies = parse(c.req.header('Cookie') || '')
    const sessionId = cookies.session_id

    if (!sessionId) {
      throw new AuthorizationException('Missing or invalid Authorization header')
    }

    // Validate the session ID using Lucia
    const { session, user } = await lucia.validateSession(sessionId)
    if (!session) {
      // If the session is invalid, clear the session cookie and return a 401 response
      const headers = new Headers({
        'Set-Cookie': lucia.createBlankSessionCookie().serialize(),
        'content-type': 'application/json;charset=UTF-8',
      })
      return new Response('Missing or invalid Authorization header', {
        status: 401,
        headers,
      })
    }
    if (session?.fresh) {
      // If the session is fresh, extend it by setting a new cookie
      c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
        append: true,
      })
    }

    const userService = new UserService(c)
    const userWithRelation = await userService.getUserByIdOrEmail(user.id) // Fetch additional details
    if (!userWithRelation) {
      throw new AuthorizationException('Missing or invalid Authorization header')
    }

    // Attach the session and user to the context
    c.set('session', session)
    c.set('user', userWithRelation)

    await next()
  }
}

import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import app from '~/index'
import { generateSalt, hashPassword } from '~/utils'

const baseUrl = 'http://localhost/api/v1/auth'

describe('Auth API', () => {
  const registeredUser: {
    email: string
    password: string
    name: string
    userId?: string
  } | null = {
    email: 'testuser@example.com',
    password: 'Password123',
    name: 'Test User',
  }

  // Create a shared execution context
  beforeAll(async () => {
    const userId = `usr_${Date.now()}`
    const keyId = `email:${registeredUser?.email}`

    const salt = generateSalt()
    const hashedPassword = hashPassword(registeredUser?.password || '', salt)

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`).bind(userId, registeredUser?.email, registeredUser?.name),
      env.DB.prepare(`INSERT INTO user_keys (id, user_id, hashed_password, salt) VALUES (?, ?, ?, ?)`).bind(
        keyId,
        userId,
        hashedPassword,
        salt,
      ),
    ])

    registeredUser!.userId = userId
  })

  it('should register a new user', async () => {
    const request = new Request(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      }),
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    // Assert response status
    expect(response.status).toBe(200)

    const responseBody: any = await response.json()

    // Assert the structure of the response
    expect(responseBody).toHaveProperty('statusCode', 200)
    expect(responseBody).toHaveProperty('message', 'Success')
    expect(responseBody).toHaveProperty('data')

    // Assert structure of data
    const data = responseBody.data
    expect(data).toHaveProperty('userId')
    expect(data).toHaveProperty('email', 'newuser@example.com')
  })

  it('should not register a user with duplicate email', async () => {
    const request = new Request(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredUser?.email,
        password: registeredUser?.password,
        name: registeredUser?.name,
      }),
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    // Assert response status
    expect(response.status).toBe(400)

    const responseBody: any = await response.json()

    // Assert the structure of the response
    expect(responseBody).toHaveProperty('statusCode', 400)
    expect(responseBody).toHaveProperty('message')
    expect(responseBody.message).toMatch(/Email already exists/)
  })

  it('should login a user', async () => {
    const request = new Request(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredUser?.email,
        password: registeredUser?.password,
      }),
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    // Assert response status
    expect(response.status).toBe(200)

    const responseBody: any = await response.json()

    // Assert the structure of the response
    expect(responseBody).toHaveProperty('statusCode', 200)
    expect(responseBody).toHaveProperty('message', 'Success')
    expect(responseBody).toHaveProperty('data')

    // // Assert structure of data
    const data = responseBody.data
    expect(data).toHaveProperty('session')
    expect(data.session).toHaveProperty('id')
    expect(data.session).toHaveProperty('userId', registeredUser?.userId)
    expect(data.session).toHaveProperty('fresh', true)
    expect(data.session).toHaveProperty('expiresAt')

    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('id', registeredUser?.userId)
    expect(data.user).toHaveProperty('email', registeredUser?.email)
    expect(data.user).toHaveProperty('name', registeredUser?.name)
  })

  it('should log out a user', async () => {
    // Perform login to get a session token
    const loginRequest = new Request(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredUser?.email,
        password: registeredUser?.password,
      }),
    })

    const ctxLogin = createExecutionContext()
    const loginResponse = await app.fetch(loginRequest, env, ctxLogin)
    await waitOnExecutionContext(ctxLogin)

    const loginResponseBody: any = await loginResponse.json()
    const sessionToken = loginResponseBody.data.session.id

    // Perform logout using the session token
    const logoutRequest = new Request(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    const ctxLogout = createExecutionContext()
    const logoutResponse = await app.fetch(logoutRequest, env, ctxLogout)
    await waitOnExecutionContext(ctxLogout)

    // Assert response status
    expect(logoutResponse.status).toBe(200)

    const logoutResponseBody: any = await logoutResponse.json()

    // Assert the structure of the response
    expect(logoutResponseBody).toHaveProperty('statusCode', 200)
    expect(logoutResponseBody).toHaveProperty('message', 'User logged out successfully')
    expect(logoutResponseBody).toHaveProperty('data')

    // Assert structure of data
    expect(logoutResponseBody.data).toHaveProperty('message', 'User logged out successfully')
  })
})

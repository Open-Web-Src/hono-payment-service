import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test'
import { describe, it, expect, beforeAll } from 'vitest'
import app from '~/index'
import { generateSalt, hashPassword } from '~/utils'

const baseUrl = 'http://localhost/api/v1/user'

describe('User API', () => {
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
  let sessionToken: string | null = null

  // Seed the database and log in the user before all tests
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

    // Log in the user to get a session token
    const loginRequest = new Request(`${baseUrl.replace('/user', '/auth')}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredUser?.email,
        password: registeredUser?.password,
      }),
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(loginRequest, env, ctx)
    await waitOnExecutionContext(ctx)

    const responseBody: any = await response.json()
    sessionToken = responseBody.data.session.id
  })

  it("should fetch the authenticated user's details", async () => {
    const request = new Request(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
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
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('id', registeredUser?.userId)
    expect(data.user).toHaveProperty('email', registeredUser?.email)
    expect(data.user).toHaveProperty('name', registeredUser?.name)
  })

  it('should return 401 if no authorization header is provided', async () => {
    const request = new Request(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    // Assert response status
    expect(response.status).toBe(401)

    const responseBody: any = await response.json()

    // Assert the structure of the response
    expect(responseBody).toHaveProperty('statusCode', 401)
    expect(responseBody).toHaveProperty('message')
    expect(responseBody.message).toMatch(/Missing or invalid Authorization header/)
  })

  it('should return 401 if an invalid token is provided', async () => {
    const request = new Request(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_token',
      },
    })

    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    // Assert response status
    expect(response.status).toBe(401)

    const responseBody: any = await response.json()

    // Assert the structure of the response
    expect(responseBody).toHaveProperty('statusCode', 401)
    expect(responseBody).toHaveProperty('message')
    expect(responseBody.message).toMatch(/Missing or invalid Authorization header/)
  })
})

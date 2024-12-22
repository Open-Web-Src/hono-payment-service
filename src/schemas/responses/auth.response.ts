import { z } from 'zod'

// Register Response Schema
export const registerResponseSchema = z.object({
  id: z.string().uuid('User ID'),
  name: z.string(),
  email: z.string(),
})
export type RegisterResponse = z.infer<typeof registerResponseSchema>

// Login Response Schema
export const loginResponseSchema = z.object({
  id: z.string().uuid('Session ID'),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

// Logout Response Schema
export const logoutResponseSchema = z.object({})
export type LogoutResponse = z.infer<typeof logoutResponseSchema>

import { z } from 'zod';

// Register Request Schema
export const registerRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// Login Request Schema
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

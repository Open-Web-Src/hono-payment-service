import { Context, Env } from 'hono'
import { NotFoundException, BadRequestException } from '~/exceptions'
import { users, userKeys } from '~/database'
import { eq } from 'drizzle-orm'
import { hashPassword, generateSalt, newULID } from '~/utils'

export class UserService {
  private readonly db: DrizzleDatabase

  constructor(private readonly context: Context<Env>) {
    this.db = context.get('db')
  }

  /**
   * Get a user by ID or email
   */
  async getUserByIdOrEmail(identifier: string): Promise<UserWithRelations> {
    const user = await this.db.query.users.findFirst({
      where: (table, { or, eq }) => or(eq(table.id, identifier), eq(table.email, identifier.toLowerCase())),
    })

    if (!user) {
      throw new NotFoundException(`User with identifier ${identifier} not found`)
    }

    return user
  }

  /**
   * Get a user by Stripe Customer ID
   */
  async getUserByStripeCustomerId(customerId: string): Promise<UserWithRelations> {
    const user = await this.db.query.users.findFirst({
      where: table => eq(table.stripe_customer_id, customerId),
    })

    if (!user) {
      throw new NotFoundException(`User with Stripe Customer ID ${customerId} not found`)
    }

    return user
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return await this.db.query.users.findMany()
  }

  /**
   * Create a new user
   */
  async createUser(payload: { email: string; name: string; password: string }) {
    const userId = newULID('user')
    const keyId = `email:${payload.email.toLowerCase()}`

    const salt = generateSalt()
    const hashedPassword = hashPassword(payload.password, salt)

    try {
      await this.db.batch([
        this.db.insert(users).values({
          id: userId,
          email: payload.email.toLowerCase(),
          name: payload.name,
        }),
        this.db.insert(userKeys).values({
          id: keyId,
          user_id: userId,
          hashed_password: hashedPassword,
          salt,
        }),
      ])
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed: users.email')) {
        throw new BadRequestException('Email already exists')
      }
      throw new BadRequestException('Failed to create user')
    }

    return { userId, email: payload.email }
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, payload: Partial<User>) {
    const user = await this.getUserByIdOrEmail(userId)
    const updatedUser = await this.db.update(users).set(payload).where(eq(users.id, user.id)).returning()
    return updatedUser[0]
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    const user = await this.getUserByIdOrEmail(userId)

    await this.db.delete(users).where(eq(users.id, user.id))
    await this.db.delete(userKeys).where(eq(userKeys.user_id, user.id))

    return { message: `User with ID ${userId} deleted successfully` }
  }
}

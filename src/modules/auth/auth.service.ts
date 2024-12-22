import { Context, Env } from 'hono'
import { AuthorizationException } from '~/exceptions'
import { UserService } from '~/modules/index-service'
import { verifyPassword } from '~/utils'

export class AuthService {
  private readonly lucia: LuciaUserType
  private readonly userService: UserService

  constructor(private readonly context: Context<Env>) {
    this.lucia = context.get('lucia')
    this.userService = new UserService(context)
  }

  /**
   * Register a new user
   */
  async register(payload: { email: string; password: string; name: string }) {
    try {
      const user = await this.userService.createUser(payload)
      return { userId: user.userId, email: user.email }
    } catch (error) {
      throw error // Let the exceptions propagate (e.g., BadRequestException for existing email)
    }
  }

  /**
   * Login a user
   */
  async login(payload: { email: string; password: string }) {
    // Fetch the user by email
    const user = await this.userService.getUserByIdOrEmail(payload.email)
    if (!user) {
      throw new AuthorizationException('Invalid email or password')
    }

    // Fetch the user's keys
    const key = await this.context.get('db').query.userKeys.findFirst({
      where: (table, { eq }) => eq(table.user_id, user.id),
    })

    if (!key || !verifyPassword(payload.password, key.hashed_password)) {
      throw new AuthorizationException('Invalid email or password')
    }

    const session = await this.lucia.createSession(user.id, {})
    return { session, user }
  }

  /**
   * Logout a user
   */
  async logout(sessionId: string) {
    try {
      await this.lucia.invalidateSession(sessionId)
      return { message: `User logged out successfully` }
    } catch (error) {
      console.log(error)
      throw new AuthorizationException('Failed to log out. Please try again.')
    }
  }
}

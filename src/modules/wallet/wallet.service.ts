import { Context, Env } from 'hono'
import { eq } from 'drizzle-orm'
import { userWallets } from '~/database'
import { newULID } from '~/utils'

export class WalletService {
  private readonly db: DrizzleDatabase

  constructor(private readonly context: Context<Env>) {
    this.db = context.get('db')
  }

  /**
   * Ensure the user's wallet exists
   */
  private async ensureWalletExists(userId: string) {
    const wallet = await this.db.query.userWallets.findFirst({
      where: eq(userWallets.user_id, userId),
    })

    if (!wallet) {
      const walletId = newULID('wallet')
      // Create the wallet with a default balance of 0
      await this.db.insert(userWallets).values({
        id: walletId,
        user_id: userId,
        balance: 0,
      })
    }
  }

  /**
   * Get the user's wallet details, ensuring it exists
   */
  async getWallet(userId: string) {
    // Ensure the wallet exists
    await this.ensureWalletExists(userId)

    // Fetch the wallet details
    const wallet = await this.db.query.userWallets.findFirst({
      where: eq(userWallets.user_id, userId),
    })

    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`)
    }

    return wallet
  }

  /**
   * Increase the user's wallet balance
   */
  async increaseBalance(userId: string, amount: number) {
    // Ensure the wallet exists
    await this.ensureWalletExists(userId)

    const wallet = await this.db.query.userWallets.findFirst({
      where: eq(userWallets.user_id, userId),
    })

    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`)
    }

    await this.db
      .update(userWallets)
      .set({ balance: wallet.balance + amount })
      .where(eq(userWallets.user_id, userId))
  }

  /**
   * Decrease the user's wallet balance
   */
  async decreaseBalance(userId: string, amount: number) {
    // Ensure the wallet exists
    await this.ensureWalletExists(userId)

    const wallet = await this.db.query.userWallets.findFirst({
      where: eq(userWallets.user_id, userId),
    })

    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`)
    }

    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance in wallet for user ID: ${userId}`)
    }

    await this.db
      .update(userWallets)
      .set({ balance: wallet.balance - amount })
      .where(eq(userWallets.user_id, userId))
  }
}

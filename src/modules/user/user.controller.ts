import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getMeRouteDocs, getUserWalletDocs } from './user.docs'
import { WalletService } from '../index-service'

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

/**
 * Get the authenticated user's wallet details
 */
app.openapi(createRoute(getUserWalletDocs('/wallet')), async c => {
  const userId = c.get('user')?.id
  const walletService = new WalletService(c)

  try {
    // Fetch wallet details using WalletService
    const wallet = await walletService.getWallet(userId!)
    return c.json({ wallet }, 200)
  } catch (error: any) {
    console.error(`Error fetching wallet: ${error.message}`)
    return c.json({ error: error.message }, 500)
  }
})

export default app

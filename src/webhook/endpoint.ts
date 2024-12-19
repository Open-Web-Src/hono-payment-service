import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { setupDb, requestLogger } from '~/middlewares'
import { globalExceptionsFilter } from '~/filters'
import { STRIPE_ENDPOINT_V1 } from './platforms'

const webhook = new OpenAPIHono()

// This middleware sets up the database connection for the application.
// It ensures that a database connection is established before any request is processed.
webhook.use(setupDb())

webhook.use(cors())

// logger middleware
webhook.use(requestLogger())

// API routing here
webhook.route('/stripe/v1', STRIPE_ENDPOINT_V1.default)

// API routing here

// Global error handler
webhook.onError(globalExceptionsFilter)

export default webhook

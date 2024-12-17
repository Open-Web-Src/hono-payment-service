import { OpenAPIHono } from '@hono/zod-openapi'
import type { OpenAPIObjectConfig } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { setupDb, setupLucia, requestLogger } from '~/middlewares'
import { responseInterceptor } from '~/interceptors'
import { globalExceptionsFilter } from '~/filters'
import { AUTH_ENDPOINT, USER_ENDPOINT } from '~/modules'

const apiV1 = new OpenAPIHono()

// Register the BearerAuth security scheme
apiV1.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  name: 'Authorization',
  scheme: 'bearer',
  in: 'header',
  description: 'Bearer token',
})

export const config: OpenAPIObjectConfig = {
  openapi: '3.1.0',
  info: {
    title: 'Spiral API',
    version: '1.0.0',
  },
  security: [
    {
      Bearer: [],
    },
  ],
  servers: [
    { url: 'http://localhost:8787/api/v1', description: 'Local' },
    {
      url: 'https://dev.app.com/api/v1',
      description: 'Development',
    },
    { url: 'https://stg.app.com/api/v1', description: 'Staging' },
    { url: 'https://app.com/api/v1', description: 'Production' },
  ],
}

// This middleware sets up the database connection for the application.
// It ensures that a database connection is established before any request is processed.
apiV1.use(setupDb())

// Use a middleware to attach lucia to the context
apiV1.use(setupLucia())

apiV1.use(cors())

// logger middleware
apiV1.use(requestLogger())

// Apply the response interceptor middleware globally
apiV1.use('*', responseInterceptor())

apiV1.route('/auth', AUTH_ENDPOINT.default)
apiV1.route('/user', USER_ENDPOINT.default)

// API routing here

// Global error handler
apiV1.onError(globalExceptionsFilter)

// Use the middleware to serve Swagger UI at /ui
try {
  apiV1.get('/docs', swaggerUI({ url: './openapi.json' }))
} catch (e) {
  console.log(e)
}
apiV1.doc31('/openapi.json', config)
apiV1.getOpenAPI31Document(config)

export default apiV1
export const registry = apiV1.openAPIRegistry

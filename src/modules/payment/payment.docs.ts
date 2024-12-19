import { z, type RouteConfig } from '@hono/zod-openapi'
import { enforceUserBearerToken } from '~/middlewares'
import {
  createSubscriptionRequestSchema,
  createSubscriptionResponseSchema,
  paginationQuerySchema,
  paymentHistoryResponseSchema,
  paymentMethodsResponseSchema,
  processPaymentRequestSchema,
  processPaymentResponseSchema,
  setupIntentResponseSchema,
} from '~/schemas'

export function createSetupIntentDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Create SetupIntent for payment method linking',
    method: 'post',
    tags: ['Payment'],
    middleware: [enforceUserBearerToken()],
    path: route,
    responses: {
      200: {
        description: 'Client secret for SetupIntent',
        content: {
          'application/json': {
            schema: setupIntentResponseSchema,
          },
        },
      },
    },
  }
}

export function processPaymentDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Process a one-time payment',
    method: 'post',
    tags: ['Payment'],
    middleware: [enforceUserBearerToken()],
    path: route,
    request: {
      body: {
        content: {
          'application/json': {
            schema: processPaymentRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Payment processed successfully',
        content: {
          'application/json': {
            schema: processPaymentResponseSchema,
          },
        },
      },
    },
  }
}

export function createSubscriptionDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Create a fixed-price subscription',
    method: 'post',
    tags: ['Subscription'],
    middleware: [enforceUserBearerToken()],
    path: route,
    request: {
      body: {
        content: {
          'application/json': {
            schema: createSubscriptionRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Subscription created successfully',
        content: {
          'application/json': {
            schema: createSubscriptionResponseSchema,
          },
        },
      },
    },
  }
}

export function getPaymentMethodsDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'List payment methods for a user',
    method: 'get',
    tags: ['Payment'],
    middleware: [enforceUserBearerToken()],
    path: route,
    responses: {
      200: {
        description: 'List of payment methods',
        content: {
          'application/json': {
            schema: paymentMethodsResponseSchema,
          },
        },
      },
    },
  }
}

export function getPaymentHistoryDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Get payment history with pagination',
    method: 'get',
    tags: ['Payment'],
    middleware: [enforceUserBearerToken()],
    path: route,
    request: {
      query: paginationQuerySchema,
    },
    responses: {
      200: {
        description: 'Paginated payment history',
        content: {
          'application/json': {
            schema: paymentHistoryResponseSchema,
          },
        },
      },
    },
  }
}

export function downloadInvoiceDocs(path: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    method: 'get',
    path,
    tags: ['Invoices'],
    summary: 'Download an Invoice as a PDF',
    description: 'Retrieve and directly download a PDF of the specified invoice.',
    request: {
      params: z.object({
        invoiceId: z.string().describe('The ID of the invoice to download'),
      }),
    },
    responses: {
      200: {
        content: {
          'application/pdf': {
            schema: z.string().describe('The PDF URL of the invoice'),
          },
        },
        description: 'Successfully retrieved the invoice PDF',
      },
    },
  }
}

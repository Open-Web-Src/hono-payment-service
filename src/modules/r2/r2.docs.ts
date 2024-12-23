import { z, type RouteConfig } from '@hono/zod-openapi'

export function uploadFileDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Upload a file to R2 bucket',
    method: 'post',
    tags: ['R2'],
    path: route,
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.instanceof(File).describe('The file to upload (image/video).'),
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'File uploaded successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
              filename: z.string(),
            }),
          },
        },
      },
    },
  }
}

export function loadFileDocs(route: string): Omit<RouteConfig, 'path'> & { path: string } {
  return {
    summary: 'Load a file from R2 bucket',
    method: 'get',
    tags: ['R2'],
    path: route,
    request: {
      params: z.object({
        filename: z.string().describe('The name of the file to retrieve from R2.'),
      }),
    },
    responses: {
      200: {
        description: 'File retrieved successfully',
        content: {
          'application/octet-stream': {
            schema: z.instanceof(Uint8Array).describe('The file content.'),
          },
        },
      },
    },
  }
}

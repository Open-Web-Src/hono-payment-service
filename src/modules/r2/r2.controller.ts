import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { R2Service } from './r2.service'
import { uploadFileDocs, loadFileDocs } from './r2.docs'

const app = new OpenAPIHono()

/**
 * Upload a file to R2 bucket
 */
app.openapi(createRoute(uploadFileDocs('/upload-file')), async c => {
  const r2Service = new R2Service(c)

  try {
    // Parse the multipart form data
    const formData = await c.req.formData()
    const file = formData.get('file') as unknown as File

    if (!file) {
      return c.json({ success: false, message: 'File is required.' }, 400)
    }

    // Use the file's name directly
    const filename = file.name

    if (!filename) {
      return c.json({ success: false, message: 'File name is missing.' }, 400)
    }

    const buffer = await file.arrayBuffer()
    const uploadedFilename = await r2Service.uploadFile(filename, buffer)

    return c.json(
      {
        success: true,
        message: 'File uploaded successfully.',
        filename: uploadedFilename,
      },
      200,
    )
  } catch (error: any) {
    console.error(`Failed to upload file: ${error.message}`)
    return c.json({ success: false, message: error.message }, 500)
  }
})

/**
 * Load a file from R2 bucket
 */
app.openapi(createRoute(loadFileDocs('/load-file/:filename')), async c => {
  const r2Service = new R2Service(c)
  const filename = c.req.param('filename')

  if (!filename) {
    return c.json({ success: false, message: 'Filename is required.' }, 400)
  }

  try {
    const fileData = await r2Service.getFile(filename)

    if (!fileData) {
      return c.json({ success: false, message: 'File not found.' }, 404)
    }

    return c.body(fileData, 200, {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/octet-stream',
    })
  } catch (error: any) {
    console.error(`Failed to load file: ${error.message}`)
    return c.json({ success: false, message: error.message }, 500)
  }
})

export default app

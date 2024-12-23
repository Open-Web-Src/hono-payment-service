import type { R2Bucket } from '@cloudflare/workers-types'
import type { Context, Env } from 'hono'

export class R2Service {
  private readonly bucket: R2Bucket

  constructor(c: Context<Env>) {
    this.bucket = this.getR2Bucket(c.env)
  }

  getR2Bucket(env: any) {
    console.log(env.ENVIRONMENT)
    // Centralize the logic for selecting the R2 bucket based on the environment
    if (env.ENVIRONMENT === 'production') {
      return env.PROD_BUCKET
    } else if (env.ENVIRONMENT === 'staging') {
      return env.STAGING_BUCKET
    } else if (env.ENVIRONMENT === 'development') {
      return env.DEV_BUCKET
    } else {
      return env.LOCAL_BUCKET
    }
  }

  // Method to upload a file to R2
  async uploadFile(filename: string, data: ArrayBuffer): Promise<string> {
    // Store the file directly in R2 without optimizing
    await this.bucket.put(filename, data)
    return filename
  }

  // Method to retrieve a file from R2
  async getFile(filename: string): Promise<ArrayBuffer | null> {
    const object = await this.bucket.get(filename)
    if (!object) {
      return null // File not found
    }

    const data = await object.arrayBuffer() // Get the data as an ArrayBuffer
    return data
  }

  // New method to delete a file from R2
  async deleteFile(filename: string) {
    try {
      await this.bucket.delete(filename)
    } catch (error: any) {
      throw new Error(`Failed to delete file from R2: ${error.message}`)
    }
  }
}

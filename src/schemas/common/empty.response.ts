import { z } from 'zod'

export const emptyDataResponseSchema = z.object({})
export type Empty = z.infer<typeof emptyDataResponseSchema>

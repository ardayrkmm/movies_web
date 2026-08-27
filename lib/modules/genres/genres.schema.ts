/**
 * Genres — Zod Validation Schemas
 */

import { z } from 'zod'

export const createGenreSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim(),
})

export const updateGenreSchema = createGenreSchema.partial()

export type CreateGenreInput = z.infer<typeof createGenreSchema>
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>

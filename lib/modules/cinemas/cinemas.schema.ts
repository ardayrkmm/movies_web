/**
 * Cinemas — Zod Validation Schemas
 */

import { z } from 'zod'

export const createCinemaSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1).max(500).trim(),
  city: z.string().min(1).max(100).trim(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const updateCinemaSchema = createCinemaSchema.partial().extend({
  isActive: z.boolean().optional()
})

export const cinemaFiltersSchema = z.object({
  city: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
})

export type CreateCinemaSchema = z.infer<typeof createCinemaSchema>
export type UpdateCinemaSchema = z.infer<typeof updateCinemaSchema>
export type CinemaFiltersSchema = z.infer<typeof cinemaFiltersSchema>

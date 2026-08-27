/**
 * Movies — Zod Validation Schemas
 */

import { z } from 'zod'

export const movieStatusSchema = z.enum(['UPCOMING', 'NOW_SHOWING', 'ENDED'])

export const createMovieSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(200),
  description: z.string().min(1).max(5000).trim(),
  posterUrl: z.string().url().optional(),
  backdropUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  duration: z.number().int().positive().min(1).max(600),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  ageRating: z.string().min(1).max(10),
  language: z.string().min(1).max(50),
  status: movieStatusSchema,
  genres: z.array(z.string().min(1)).min(1, 'At least one genre required'),
})

export const updateMovieSchema = createMovieSchema.partial()

export const movieFiltersSchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  status: movieStatusSchema.optional(),
  ageRating: z.string().optional(),
  sortBy: z.enum(['newest', 'releaseDate', 'title']).optional().default('newest'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
})

export type CreateMovieInput = z.infer<typeof createMovieSchema>
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>
export type MovieFiltersInput = z.infer<typeof movieFiltersSchema>

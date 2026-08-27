/**
 * Studios — Zod Validation Schemas
 */

import { z } from 'zod'

export const studioTypeSchema = z.enum(['REGULAR', 'VIP', 'IMAX', 'PREMIERE'])

export const createStudioSchema = z.object({
  cinemaId: z.string().min(1),
  name: z.string().min(1).max(100).trim(),
  type: studioTypeSchema,
  totalSeats: z.number().int().positive().min(1).max(1000),
})

export const updateStudioSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  type: studioTypeSchema.optional(),
  totalSeats: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export type CreateStudioSchema = z.infer<typeof createStudioSchema>
export type UpdateStudioSchema = z.infer<typeof updateStudioSchema>

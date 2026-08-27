/**
 * Seats — Zod Validation Schemas
 */

import { z } from 'zod'

export const seatTypeSchema = z.enum(['REGULAR', 'VIP', 'DISABLED'])
export const seatStatusSchema = z.enum(['AVAILABLE', 'INACTIVE'])

export const createSeatSchema = z.object({
  row: z.string().min(1).max(5).toUpperCase(),
  number: z.number().int().positive(),
  label: z.string().min(1).max(10),
  type: seatTypeSchema.default('REGULAR'),
  priceModifier: z.number().positive().default(1.0),
})

export const updateSeatSchema = z.object({
  type: seatTypeSchema.optional(),
  priceModifier: z.number().positive().optional(),
  status: seatStatusSchema.optional(),
})

export const bulkCreateSeatsSchema = z.object({
  rows: z.array(z.string().min(1).max(5)).min(1),
  seatsPerRow: z.number().int().positive().min(1).max(50),
  type: seatTypeSchema.default('REGULAR'),
  priceModifier: z.number().positive().default(1.0),
})

export type CreateSeatSchema = z.infer<typeof createSeatSchema>
export type UpdateSeatSchema = z.infer<typeof updateSeatSchema>
export type BulkCreateSeatsSchema = z.infer<typeof bulkCreateSeatsSchema>

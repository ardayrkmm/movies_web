import { z } from 'zod';
export const showtimeStatusSchema = z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']);
export const createShowtimeSchema = z.object({
  movieId: z.string().min(1),
  cinemaId: z.string().min(1),
  studioId: z.string().min(1),
  startAt: z.string().datetime({ message: 'Must be ISO datetime string' }),
  basePrice: z.number().int().positive(),
});
export const updateShowtimeSchema = z.object({
  startAt: z.string().datetime().optional(),
  basePrice: z.number().int().positive().optional(),
  status: showtimeStatusSchema.optional(),
});
export const showtimeFiltersSchema = z.object({
  movieId: z.string().optional(),
  cinemaId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  city: z.string().optional(),
  status: showtimeStatusSchema.optional(),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
});
export type CreateShowtimeInputSchema = z.infer<typeof createShowtimeSchema>;
export type UpdateShowtimeInputSchema = z.infer<typeof updateShowtimeSchema>;
export type ShowtimeFiltersInputSchema = z.infer<typeof showtimeFiltersSchema>;

import { z } from 'zod';
export const reservationStatusSchema = z.enum(['PENDING','PAID','CONFIRMED','CANCELLED','EXPIRED']);
export const createReservationSchema = z.object({
  showtimeId: z.string().min(1),
  seatIds: z.array(z.string().min(1)).min(1, 'At least one seat required').max(10, 'Maximum 10 seats per reservation'),
});
export const cancelReservationSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CreateReservationInputSchema = z.infer<typeof createReservationSchema>;

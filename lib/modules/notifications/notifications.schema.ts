import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "BOOKING_CREATED",
  "PAYMENT_SUCCESS",
  "BOOKING_CANCELLED",
  "BOOKING_EXPIRING",
  "MOVIE_REMINDER",
  "SYSTEM",
]);

export const notificationFiltersSchema = z.object({
  isRead: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  page: z.string().optional().default("1").transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default("20").transform(Number).pipe(z.number().int().min(1).max(50)),
});

export type NotificationFiltersInputSchema = z.infer<typeof notificationFiltersSchema>;

import { z } from "zod";

export const createReviewSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInputSchema = z.infer<typeof createReviewSchema>;
export type UpdateReviewInputSchema = z.infer<typeof updateReviewSchema>;

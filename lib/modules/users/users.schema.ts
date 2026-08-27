import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid phone number").optional(),
  photoUrl: z.string().url("Invalid URL").optional(),
});

export type UpdateUserInputSchema = z.infer<typeof updateUserSchema>;

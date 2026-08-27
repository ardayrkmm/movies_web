import { z } from "zod";

export const dateRangeSchema = z.object({
  period: z.enum(["today", "this_week", "this_month", "custom"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine((data) => {
  if (data.period === "custom") {
    return !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "startDate and endDate are required when period is custom",
});

export type DateRangeQuerySchema = z.infer<typeof dateRangeSchema>;

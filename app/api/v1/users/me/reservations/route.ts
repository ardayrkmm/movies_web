import { withApiHandler } from "@/lib/api/handler";
import { paginatedResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { ReservationsService } from "@/lib/modules/reservations/reservations.service";
import { reservationStatusSchema } from "@/lib/modules/reservations/reservations.schema";
import { z } from "zod";
import { searchParamsToObject } from "@/lib/validations/common";

export const dynamic = "force-dynamic";

const reservationsService = new ReservationsService();

const querySchema = z.object({
  status: reservationStatusSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  page: z.string().optional().default("1").transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default("10").transform(Number).pipe(z.number().int().min(1).max(50)),
});

export const GET = withApiHandler(async (req) => {
  const user = requireAuth(req);
  
  const { searchParams } = new URL(req.url);
  const query = querySchema.parse(searchParamsToObject(searchParams));
  
  const history = await reservationsService.getUserBookingHistory(
    user.userId,
    query.status,
    query.date,
    query.page,
    query.limit
  );
  
  return paginatedResponse(
    history.items,
    history.total,
    history.page,
    history.limit,
    "Booking history retrieved successfully"
  );
});

import { createReservationSchema } from "@/lib/modules/reservations/reservations.schema";
import { successResponse } from "@/lib/api/response";

export const POST = withApiHandler(async (req) => {
  const user = requireAuth(req);
  const body = await req.json();
  const input = createReservationSchema.parse(body);

  const reservation = await reservationsService.createReservation(user.userId, input);
  return successResponse(reservation, "Reservation created successfully");
});

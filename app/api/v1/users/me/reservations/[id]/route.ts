import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { ReservationsService } from "@/lib/modules/reservations/reservations.service";
import { cancelReservationSchema } from "@/lib/modules/reservations/reservations.schema";

export const dynamic = "force-dynamic";

const reservationsService = new ReservationsService();

export const GET = withApiHandler(async (req, context) => {
  const user = requireAuth(req);
  const params = await context?.params;
  const id = params?.id as string;
  
  const reservation = await reservationsService.getReservationById(id, user.userId, user.role);
  return successResponse(reservation, "Reservation fetched successfully");
});

export const POST = withApiHandler(async (req, context) => {
  const user = requireAuth(req);
  const params = await context?.params;
  const id = params?.id as string;
  
  // Actually, we should probably only support cancel or payment via specific endpoints,
  // but if the user requested a cancellation via POST, we can support it here.
  const body = await req.json().catch(() => ({}));
  
  // if action is cancel:
  if (body.action === 'cancel') {
     cancelReservationSchema.parse(body);
     const cancelled = await reservationsService.cancelReservation(id, user.userId, user.role);
     return successResponse(cancelled, "Reservation cancelled successfully");
  }

  throw new Error("Invalid action");
});

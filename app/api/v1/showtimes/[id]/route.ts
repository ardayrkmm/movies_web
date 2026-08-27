import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { ShowtimesService } from "@/lib/modules/showtimes/showtimes.service";
import { updateShowtimeSchema } from "@/lib/modules/showtimes/showtimes.schema";
import { requireRole } from "@/lib/middleware/auth";

export const dynamic = "force-dynamic";

const showtimesService = new ShowtimesService();

export const GET = withApiHandler(async (req: Request, context: any) => {
  const { id } = await context.params;
  const showtime = await showtimesService.getShowtimeById(id);
  return successResponse(showtime);
});

export const PUT = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  const body = await req.json();
  const input = updateShowtimeSchema.parse(body);

  const showtime = await showtimesService.updateShowtime(id, input);
  return successResponse(showtime, "Showtime updated successfully");
});

export const DELETE = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  
  await showtimesService.deleteShowtime(id);
  return successResponse(null, "Showtime deleted successfully");
});

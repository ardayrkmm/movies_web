import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { CinemasService } from "@/lib/modules/cinemas/cinemas.service";
import { updateCinemaSchema } from "@/lib/modules/cinemas/cinemas.schema";
import { requireRole } from "@/lib/middleware/auth";

export const dynamic = "force-dynamic";

const cinemasService = new CinemasService();

export const GET = withApiHandler(async (req: Request, context: any) => {
  const { id } = await context.params;
  const cinema = await cinemasService.getCinemaById(id);
  return successResponse(cinema);
});

export const PUT = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  const body = await req.json();
  const input = updateCinemaSchema.parse(body);

  const cinema = await cinemasService.updateCinema(id, input);
  return successResponse(cinema, "Cinema updated successfully");
});

export const DELETE = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  
  await cinemasService.deleteCinema(id);
  return successResponse(null, "Cinema deleted successfully");
});

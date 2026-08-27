import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { StudiosService } from "@/lib/modules/studios/studios.service";
import { createStudioSchema } from "@/lib/modules/studios/studios.schema";
import { requireRole } from "@/lib/middleware/auth";

export const dynamic = "force-dynamic";

const studiosService = new StudiosService();

export const GET = withApiHandler(async (req: Request, context: any) => {
  const { id } = await context.params;
  const studios = await studiosService.getStudiosByCinema(id);
  return successResponse(studios);
});

export const POST = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  const body = await req.json();
  const input = createStudioSchema.parse({ ...body, cinemaId: id });

  const studio = await studiosService.createStudio(input);
  return successResponse(studio, "Studio created successfully", 201);
});

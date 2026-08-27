import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { StudiosService } from "@/lib/modules/studios/studios.service";
import { updateStudioSchema } from "@/lib/modules/studios/studios.schema";
import { requireRole } from "@/lib/middleware/auth";

export const dynamic = "force-dynamic";

const studiosService = new StudiosService();

export const GET = withApiHandler(async (req: Request, context: any) => {
  const { id } = await context.params;
  const studio = await studiosService.getStudioById(id);
  return successResponse(studio);
});

export const PUT = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  const body = await req.json();
  const input = updateStudioSchema.parse(body);

  const studio = await studiosService.updateStudio(id, input);
  return successResponse(studio, "Studio updated successfully");
});

export const DELETE = withApiHandler(async (req: Request, context: any) => {
  requireRole(req, "ADMIN");
  const { id } = await context.params;
  
  await studiosService.deleteStudio(id);
  return successResponse(null, "Studio deleted successfully");
});

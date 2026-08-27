import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { DashboardService } from "@/lib/modules/dashboard/dashboard.service";
import { z } from "zod";
import { searchParamsToObject } from "@/lib/validations/common";

export const dynamic = "force-dynamic";

const dashboardService = new DashboardService();

const querySchema = z.object({
    limit: z.string().optional().default("5").transform(Number).pipe(z.number().int().min(1).max(20)),
});

export const GET = withApiHandler(async (req) => {
  requireRole(req, "ADMIN");
  
  const { searchParams } = new URL(req.url);
  const query = querySchema.parse(searchParamsToObject(searchParams));
  
  const movies = await dashboardService.getPopularMovies(query.limit);
  return successResponse(movies, "Popular movies retrieved successfully");
});

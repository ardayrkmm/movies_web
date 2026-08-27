import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { DashboardService } from "@/lib/modules/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

const dashboardService = new DashboardService();

export const GET = withApiHandler(async (req) => {
  requireRole(req, "ADMIN");
  const stats = await dashboardService.getStats();
  return successResponse(stats, "Dashboard stats retrieved successfully");
});

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { DashboardService } from "@/lib/modules/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

const dashboardService = new DashboardService();

export const GET = withApiHandler(async (req) => {
  requireRole(req, "ADMIN");
  
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  
  const reservations = await dashboardService.getRecentReservations(limit);
  return successResponse(reservations, "Recent reservations retrieved successfully");
});

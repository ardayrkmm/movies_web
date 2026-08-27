import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { DashboardService } from "@/lib/modules/dashboard/dashboard.service";
import { dateRangeSchema } from "@/lib/modules/dashboard/dashboard.schema";
import { searchParamsToObject } from "@/lib/validations/common";

export const dynamic = "force-dynamic";

const dashboardService = new DashboardService();

export const GET = withApiHandler(async (req) => {
  requireRole(req, "ADMIN");
  
  const { searchParams } = new URL(req.url);
  const query = dateRangeSchema.parse(searchParamsToObject(searchParams));
  
  const reservations = await dashboardService.getReservations(query);
  return successResponse(reservations, "Reservations stats retrieved successfully");
});

import { withApiHandler } from "@/lib/api/handler";
import { paginatedResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { NotificationsService } from "@/lib/modules/notifications/notifications.service";
import { notificationFiltersSchema } from "@/lib/modules/notifications/notifications.schema";
import { searchParamsToObject } from "@/lib/validations/common";

export const dynamic = "force-dynamic";

const notificationsService = new NotificationsService();

export const GET = withApiHandler(async (req) => {
  const user = requireAuth(req);
  
  const { searchParams } = new URL(req.url);
  const query = notificationFiltersSchema.parse(searchParamsToObject(searchParams));
  
  const result = await notificationsService.getUserNotifications(
    user.userId,
    { isRead: query.isRead },
    query.page,
    query.limit
  );
  
  return paginatedResponse(
    result.items,
    result.total,
    result.page,
    result.limit,
    "Notifications retrieved successfully"
  );
});

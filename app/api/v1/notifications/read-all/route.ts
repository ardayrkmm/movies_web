import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { NotificationsService } from "@/lib/modules/notifications/notifications.service";

export const dynamic = "force-dynamic";

const notificationsService = new NotificationsService();

export const PATCH = withApiHandler(async (req) => {
  const user = requireAuth(req);
  
  const result = await notificationsService.markAllAsRead(user.userId);
  return successResponse(result, `Marked ${result.count} notifications as read`);
});

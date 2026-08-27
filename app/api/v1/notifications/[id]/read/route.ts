import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { NotificationsService } from "@/lib/modules/notifications/notifications.service";

export const dynamic = "force-dynamic";

const notificationsService = new NotificationsService();

export const PATCH = withApiHandler(async (req, ctx) => {
  const user = requireAuth(req);
  const { id } = await ctx!.params!;
  
  const notification = await notificationsService.markAsRead(id, user.userId);
  return successResponse(notification, "Notification marked as read");
});

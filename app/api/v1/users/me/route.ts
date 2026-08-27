import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { UsersService } from "@/lib/modules/users/users.service";
import { updateUserSchema } from "@/lib/modules/users/users.schema";

export const dynamic = "force-dynamic";

const usersService = new UsersService();

export const GET = withApiHandler(async (req) => {
  const user = requireAuth(req);
  const profile = await usersService.getMe(user.userId);
  return successResponse(profile, "Profile retrieved successfully");
});

export const PATCH = withApiHandler(async (req) => {
  const user = requireAuth(req);
  const body = await req.json();
  const input = updateUserSchema.parse(body);
  const profile = await usersService.updateMe(user.userId, input);
  return successResponse(profile, "Profile updated successfully");
});

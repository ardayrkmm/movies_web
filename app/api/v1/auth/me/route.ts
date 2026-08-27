/**
 * GET /api/v1/auth/me
 *
 * Mengambil profil user yang sedang login berdasarkan access token.
 * Membutuhkan header: Authorization: Bearer <accessToken>
 */

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { AuthService } from "@/lib/modules/auth/auth.service";

export const dynamic = "force-dynamic";

const authService = new AuthService();

export const GET = withApiHandler(async (req: Request) => {
  const user = requireAuth(req);
  const result = await authService.getMe(user.userId);
  return successResponse(result, "User fetched successfully");
});

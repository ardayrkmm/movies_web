/**
 * POST /api/v1/auth/refresh
 *
 * Menukar refresh token dengan access token dan refresh token baru (token rotation).
 * Body: { refreshToken: string }
 */

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { refreshTokenSchema } from "@/lib/modules/auth/auth.schema";
import { AuthService } from "@/lib/modules/auth/auth.service";

export const dynamic = "force-dynamic";

const authService = new AuthService();

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { refreshToken } = refreshTokenSchema.parse(body);
  const tokens = await authService.refreshTokens(refreshToken);
  return successResponse(tokens, "Tokens refreshed successfully");
});

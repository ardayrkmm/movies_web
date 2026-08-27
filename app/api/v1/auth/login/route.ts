/**
 * POST /api/v1/auth/login
 *
 * Login user dengan email dan password, mengembalikan token pair.
 */

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { loginSchema } from "@/lib/modules/auth/auth.schema";
import { AuthService } from "@/lib/modules/auth/auth.service";
import { authLimiter } from "@/lib/middleware/rate-limiter";

export const dynamic = "force-dynamic";

const authService = new AuthService();

export const POST = withApiHandler(async (req: Request) => {
  authLimiter(req);
  const body = await req.json();
  const input = loginSchema.parse(body);
  const result = await authService.login(input);
  return successResponse(result, "Login successful");
});

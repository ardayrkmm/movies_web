/**
 * POST /api/v1/auth/register
 *
 * Mendaftarkan user baru dan mengembalikan token pair.
 */

import { withApiHandler } from "@/lib/api/handler";
import { createdResponse } from "@/lib/api/response";
import { registerSchema } from "@/lib/modules/auth/auth.schema";
import { AuthService } from "@/lib/modules/auth/auth.service";
import { authLimiter } from "@/lib/middleware/rate-limiter";

export const dynamic = "force-dynamic";

const authService = new AuthService();

export const POST = withApiHandler(async (req: Request) => {
  authLimiter(req);
  const body = await req.json();
  const input = registerSchema.parse(body);
  const result = await authService.register(input);
  return createdResponse(result, "Registration successful");
});

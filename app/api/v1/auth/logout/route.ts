/**
 * POST /api/v1/auth/logout
 *
 * Logout stateless — JWT tidak di-blacklist di server.
 * Client bertanggung jawab menghapus token dari storage lokal.
 */

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async () => {
  // JWT bersifat stateless: server tidak menyimpan session.
  // Client harus menghapus accessToken dan refreshToken dari storage-nya.
  return successResponse(null, "Logged out successfully");
});

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Digunakan oleh:
 * - Load balancer / uptime monitor
 * - Flutter app untuk cek koneksi sebelum request
 * - Deployment pipeline untuk verifikasi server siap
 *
 * Cek: server running + Firestore reachable
 */

import type { HealthCheckData } from "@/lib/types/api";
import { withApiHandler } from "@/lib/api/handler";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getFirestore } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  const timestamp = new Date().toISOString();
  const env = process.env.NEXT_PUBLIC_APP_ENV ?? "unknown";
  const version = process.env.APP_VERSION ?? "1.0.0";

  // --- Cek koneksi Firestore ---
  let firestoreStatus: "ok" | "error" = "error";
  try {
    const db = getFirestore();
    // Operasi ringan: list top-level collections untuk verifikasi koneksi
    await db.listCollections();
    firestoreStatus = "ok";
  } catch {
    // Tidak lempar error — health check tetap return response dengan status "degraded"
    console.error("[Health Check] Firestore connection failed");
  }

  const overallStatus: HealthCheckData["status"] =
    firestoreStatus === "ok" ? "ok" : "degraded";

  const data: HealthCheckData = {
    status: overallStatus,
    timestamp,
    env,
    version,
    services: {
      firestore: firestoreStatus,
    },
  };

  if (overallStatus === "degraded") {
    return errorResponse(
      "Server running but some services are unavailable",
      503
    );
  }

  return successResponse(data, "All systems operational");
});

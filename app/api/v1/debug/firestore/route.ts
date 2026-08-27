/**
 * DEBUG — Firestore Connection Test
 * GET /api/v1/debug/firestore
 *
 * HANYA tersedia di development environment.
 * Endpoint ini TIDAK boleh diakses di production.
 *
 * Mengembalikan daftar collections yang ada di Firestore untuk memverifikasi koneksi.
 */

import type { HealthCheckData } from "@/lib/types/api";
import { withApiHandler } from "@/lib/api/handler";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getFirestore } from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  // Guard: hanya development
  const env = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV;
  if (env === "production") {
    return errorResponse("This endpoint is not available in production", 403);
  }

  const timestamp = new Date().toISOString();
  let firestoreStatus: "ok" | "error" = "error";
  let collections: string[] = [];
  let errorMessage: string | undefined;

  try {
    const db = getFirestore();
    const collectionRefs = await db.listCollections();
    collections = collectionRefs.map((c) => c.id);
    firestoreStatus = "ok";
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Debug/Firestore]", err);
  }

  const data: HealthCheckData & {
    collections: string[];
    expectedCollections: string[];
    error?: string;
  } = {
    status: firestoreStatus === "ok" ? "ok" : "error",
    timestamp,
    env: env ?? "unknown",
    version: process.env.APP_VERSION ?? "1.0.0",
    services: { firestore: firestoreStatus },
    collections,
    expectedCollections: Object.values(COLLECTIONS),
    ...(errorMessage ? { error: errorMessage } : {}),
  };

  if (firestoreStatus === "error") {
    return errorResponse(
      `Firestore connection failed: ${errorMessage ?? "unknown"}`,
      503
    );
  }

  return successResponse(data, "Firestore connection verified");
});

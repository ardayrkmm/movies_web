import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (req) => {
  requireRole(req, "ADMIN");
  
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  
  const db = getFirestore();
  const snap = await db.collection(COLLECTIONS.USERS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  const users = snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  });

  return successResponse({ items: users }, "Users retrieved successfully");
});

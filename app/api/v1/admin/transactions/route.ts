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
  const snap = await db.collection(COLLECTIONS.RESERVATIONS)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
    
  const reservations = await Promise.all(snap.docs.map(async (doc) => {
    const data = doc.data();
    let userName = "Unknown";
    let movieTitle = "Unknown";
    let cinemaName = "Unknown";
    
    try {
      if (data.userId) {
        const userSnap = await db.collection(COLLECTIONS.USERS).doc(data.userId).get();
        if (userSnap.exists) userName = userSnap.data()?.name || "Unknown";
      }
      if (data.showtimeId) {
        const showtimeSnap = await db.collection(COLLECTIONS.SHOWTIMES).doc(data.showtimeId).get();
        if (showtimeSnap.exists) {
           const sData = showtimeSnap.data();
           if (sData?.movieId) {
              const movieSnap = await db.collection(COLLECTIONS.MOVIES).doc(sData.movieId).get();
              if (movieSnap.exists) movieTitle = movieSnap.data()?.title || "Unknown";
           }
           if (sData?.cinemaId) {
              const cinemaSnap = await db.collection(COLLECTIONS.CINEMAS).doc(sData.cinemaId).get();
              if (cinemaSnap.exists) cinemaName = cinemaSnap.data()?.name || "Unknown";
           }
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      id: doc.id,
      bookingCode: data.bookingCode,
      total: data.total,
      status: data.status,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      user: { name: userName },
      movie: { title: movieTitle },
      cinema: { name: cinemaName }
    };
  }));

  return successResponse({ items: reservations }, "Transactions retrieved successfully");
});

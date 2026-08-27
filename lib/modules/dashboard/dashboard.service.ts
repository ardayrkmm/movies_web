import { getFirestore, AggregateField, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import type { DateRangeQuerySchema } from "./dashboard.schema";

export class DashboardService {
  
  private getDateRange(query: DateRangeQuerySchema): { start: Date, end: Date } | null {
    if (!query.period) return null;

    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (query.period) {
      case "today":
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
      case "this_week":
        // Assuming week starts on Monday
        const day = start.getUTCDay() || 7;
        start.setUTCDate(start.getUTCDate() - day + 1);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
      case "this_month":
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
      case "custom":
        if (query.startDate && query.endDate) {
          return { start: new Date(query.startDate), end: new Date(query.endDate) };
        }
        return null;
    }
    return { start, end };
  }

  async getStats() {
    const db = getFirestore();
    
    // Run parallel count queries
    const [
      usersSnap,
      moviesSnap,
      cinemasSnap,
      showtimesSnap,
      reservationsTotalSnap,
      reservationsPendingSnap,
      reservationsPaidSnap,
      reservationsCancelledSnap,
      revenueSnap
    ] = await Promise.all([
      db.collection(COLLECTIONS.USERS).count().get(),
      db.collection(COLLECTIONS.MOVIES).count().get(),
      db.collection(COLLECTIONS.CINEMAS).count().get(),
      db.collection(COLLECTIONS.SHOWTIMES).count().get(),
      db.collection(COLLECTIONS.RESERVATIONS).count().get(),
      db.collection(COLLECTIONS.RESERVATIONS).where("status", "==", "PENDING").count().get(),
      db.collection(COLLECTIONS.RESERVATIONS).where("status", "==", "PAID").count().get(),
      db.collection(COLLECTIONS.RESERVATIONS).where("status", "==", "CANCELLED").count().get(),
      // Aggregate sum of total revenue for PAID reservations
      db.collection(COLLECTIONS.RESERVATIONS)
        .where("status", "==", "PAID")
        .aggregate({ totalRevenue: AggregateField.sum("total") })
        .get()
    ]);

    return {
      totalUsers: usersSnap.data().count,
      totalMovies: moviesSnap.data().count,
      totalCinemas: cinemasSnap.data().count,
      totalShowtimes: showtimesSnap.data().count,
      totalReservations: reservationsTotalSnap.data().count,
      pendingReservations: reservationsPendingSnap.data().count,
      paidReservations: reservationsPaidSnap.data().count,
      cancelledReservations: reservationsCancelledSnap.data().count,
      totalRevenue: revenueSnap.data().totalRevenue || 0,
    };
  }

  async getRevenue(query: DateRangeQuerySchema) {
    const db = getFirestore();
    let q = db.collection(COLLECTIONS.RESERVATIONS).where("status", "==", "PAID");
    
    const range = this.getDateRange(query);
    if (range) {
      q = q.where("createdAt", ">=", Timestamp.fromDate(range.start))
           .where("createdAt", "<=", Timestamp.fromDate(range.end));
    }

    const snap = await q.aggregate({ 
      totalRevenue: AggregateField.sum("total"),
      transactionCount: AggregateField.count()
    }).get();
    
    return {
      period: query.period || "all_time",
      range,
      totalRevenue: snap.data().totalRevenue || 0,
      transactionCount: snap.data().transactionCount || 0,
    };
  }

  async getReservations(query: DateRangeQuerySchema) {
    const db = getFirestore();
    
    // If range is specified, apply to queries
    const range = this.getDateRange(query);
    
    const getCount = async (status?: string) => {
      let q: any = db.collection(COLLECTIONS.RESERVATIONS);
      if (status) q = q.where("status", "==", status);
      if (range) {
        q = q.where("createdAt", ">=", Timestamp.fromDate(range.start))
             .where("createdAt", "<=", Timestamp.fromDate(range.end));
      }
      const snap = await q.count().get();
      return snap.data().count;
    };

    const [total, pending, paid, confirmed, cancelled, expired] = await Promise.all([
      getCount(),
      getCount("PENDING"),
      getCount("PAID"),
      getCount("CONFIRMED"),
      getCount("CANCELLED"),
      getCount("EXPIRED")
    ]);

    return {
      period: query.period || "all_time",
      range,
      stats: { total, pending, paid, confirmed, cancelled, expired }
    };
  }

  async getPopularMovies(limit: number = 5) {
    const db = getFirestore();
    // Assuming popular means highest rating or highest review count.
    // For reservation count, we'd need to aggregate reservation items, which is expensive in NoSQL without a counter.
    // Since Phase 13 added reviewCount and rating, we can use that to determine popular movies easily.
    
    const snap = await db.collection(COLLECTIONS.MOVIES)
      .orderBy("rating", "desc")
      .orderBy("reviewCount", "desc")
      .limit(limit)
      .get();
      
    return snap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      rating: doc.data().rating || 0,
      reviewCount: doc.data().reviewCount || 0,
      status: doc.data().status
    }));
  }

  async getRecentReservations(limit: number = 10) {
    const db = getFirestore();
    const snap = await db.collection(COLLECTIONS.RESERVATIONS)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
      
    // In a real app we would join users and movies. For MVP dashboard we can try to fetch them if needed.
    const reservations = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      let userName = "Unknown";
      let movieTitle = "Unknown";
      
      try {
        if (data.userId) {
          const userSnap = await db.collection(COLLECTIONS.USERS).doc(data.userId).get();
          if (userSnap.exists) userName = userSnap.data()?.name || "Unknown";
        }
        if (data.showtimeId) {
          const showtimeSnap = await db.collection(COLLECTIONS.SHOWTIMES).doc(data.showtimeId).get();
          if (showtimeSnap.exists && showtimeSnap.data()?.movieId) {
             const movieSnap = await db.collection(COLLECTIONS.MOVIES).doc(showtimeSnap.data()?.movieId).get();
             if (movieSnap.exists) movieTitle = movieSnap.data()?.title || "Unknown";
          }
        }
      } catch (e) {
        // ignore errors during join
      }

      return {
        id: doc.id,
        bookingCode: data.bookingCode,
        total: data.total,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        user: { name: userName },
        movie: { title: movieTitle }
      };
    }));
    
    return { items: reservations };
  }
}

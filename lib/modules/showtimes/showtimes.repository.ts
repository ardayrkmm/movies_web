import { COLLECTIONS, getFirestore } from "@/lib/firebase/firestore";
import {
  getDocument,
  updateDocument,
  deleteDocument,
  getPaginatedCollection,
  type PaginatedResult,
} from "@/lib/firebase/firestore-helpers";
import type { Showtime, CreateShowtimeInput, UpdateShowtimeInput, ShowtimeFilters } from "./showtimes.types";
import { Timestamp } from "firebase-admin/firestore";

function mapToShowtime(id: string, data: any): Showtime {
  return {
    id,
    movieId: data.movieId,
    cinemaId: data.cinemaId,
    studioId: data.studioId,
    startAt: data.startAt instanceof Timestamp ? data.startAt.toDate().toISOString() : data.startAt,
    endAt: data.endAt instanceof Timestamp ? data.endAt.toDate().toISOString() : data.endAt,
    basePrice: data.basePrice,
    status: data.status,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
}

export class ShowtimesRepository {
  private collection = COLLECTIONS.SHOWTIMES;

  async findById(id: string): Promise<Showtime | null> {
    const doc = await getDocument<any>(this.collection, id);
    if (!doc) return null;
    return mapToShowtime(doc.id, doc);
  }

  async findMany(filters: ShowtimeFilters, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    const where: any[] = [];
    if (filters.movieId) where.push(["movieId", "==", filters.movieId]);
    if (filters.cinemaId) where.push(["cinemaId", "==", filters.cinemaId]);
    if (filters.status) where.push(["status", "==", filters.status]);
    
    if (filters.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setUTCHours(0,0,0,0);
        const endOfDay = new Date(filters.date);
        endOfDay.setUTCHours(23,59,59,999);
        
        where.push(["startAt", ">=", Timestamp.fromDate(startOfDay)]);
        where.push(["startAt", "<=", Timestamp.fromDate(endOfDay)]);
    }

    const result = await getPaginatedCollection<any>(this.collection, {
      where,
      orderBy: [["startAt", "asc"]],
      page,
      limit,
    });

    return {
        ...result,
        items: result.items.map(item => mapToShowtime(item.id, item))
    };
  }

  async findByMovieId(movieId: string, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    return this.findMany({ movieId }, page, limit);
  }

  async findByCinemaId(cinemaId: string, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    return this.findMany({ cinemaId }, page, limit);
  }

  async findOverlapping(studioId: string, startAt: Date, endAt: Date, excludeId?: string): Promise<Showtime[]> {
    // Requires Firestore composite index: studioId, endAt, startAt
    const db = getFirestore();
    const query = db.collection(this.collection)
      .where("studioId", "==", studioId)
      .where("endAt", ">", Timestamp.fromDate(startAt))
      .where("startAt", "<", Timestamp.fromDate(endAt));

    const snap = await query.get();
    let results = snap.docs.map(doc => mapToShowtime(doc.id, doc.data()));
    
    if (excludeId) {
        results = results.filter(s => s.id !== excludeId);
    }
    
    return results;
  }

  async hasActiveReservations(showtimeId: string): Promise<boolean> {
    const db = getFirestore();
    const snap = await db.collection(COLLECTIONS.RESERVATIONS)
      .where("showtimeId", "==", showtimeId)
      .where("status", "in", ["PENDING", "PAID", "CONFIRMED"])
      .limit(1)
      .get();
      
    return !snap.empty;
  }

  async create(data: Omit<Showtime, 'id' | 'createdAt' | 'updatedAt'>): Promise<Showtime> {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    const docData = {
        ...data,
        startAt: Timestamp.fromDate(new Date(data.startAt)),
        endAt: Timestamp.fromDate(new Date(data.endAt)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    
    await docRef.set(docData);
    const snap = await docRef.get();
    return mapToShowtime(snap.id, snap.data());
  }

  async update(id: string, input: UpdateShowtimeInput): Promise<Showtime | null> {
    const dataToUpdate: any = { ...input };
    if (input.startAt) {
        dataToUpdate.startAt = Timestamp.fromDate(new Date(input.startAt));
        // Note: typically if startAt changes, endAt should also change. We leave that to the service.
    }
    
    const updated = await updateDocument<any>(this.collection, id, dataToUpdate);
    if (!updated) return null;
    return mapToShowtime(updated.id, updated);
  }

  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.collection, id);
  }
}

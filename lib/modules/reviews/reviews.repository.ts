import { COLLECTIONS } from "@/lib/firebase/firestore";
import {
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getPaginatedCollection,
  type PaginatedResult,
} from "@/lib/firebase/firestore-helpers";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import type { Review, CreateReviewInput, UpdateReviewInput } from "./reviews.types";

function mapToReview(id: string, data: any): Review {
  return {
    id,
    userId: data.userId,
    movieId: data.movieId,
    reservationId: data.reservationId,
    rating: data.rating,
    comment: data.comment,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
}

export class ReviewsRepository {
  private collection = COLLECTIONS.REVIEWS;

  async findById(id: string): Promise<Review | null> {
    const doc = await getDocument<any>(this.collection, id);
    if (!doc) return null;
    return mapToReview(doc.id, doc);
  }

  async findByMovieId(movieId: string, page: number, limit: number): Promise<PaginatedResult<Review>> {
    const result = await getPaginatedCollection<any>(this.collection, {
      where: [["movieId", "==", movieId]],
      orderBy: [["createdAt", "desc"]],
      page,
      limit,
    });
    
    return {
      ...result,
      items: result.items.map(item => mapToReview(item.id, item))
    };
  }

  async findByUserAndMovie(userId: string, movieId: string): Promise<Review | null> {
    const db = getFirestore();
    const snap = await db.collection(this.collection)
      .where("userId", "==", userId)
      .where("movieId", "==", movieId)
      .limit(1)
      .get();
      
    if (snap.empty) return null;
    return mapToReview(snap.docs[0].id, snap.docs[0].data());
  }
  
  async findByUserAndReservation(userId: string, reservationId: string): Promise<Review | null> {
    const db = getFirestore();
    const snap = await db.collection(this.collection)
      .where("userId", "==", userId)
      .where("reservationId", "==", reservationId)
      .limit(1)
      .get();
      
    if (snap.empty) return null;
    return mapToReview(snap.docs[0].id, snap.docs[0].data());
  }

  // creation will be handled in service to run inside a transaction
  // for updating movie ratings.

  async update(id: string, input: UpdateReviewInput): Promise<Review | null> {
    // Basic update without transaction, but actually for ratings we should
    // run this in a transaction in the service.
    const updated = await updateDocument<any>(this.collection, id, input);
    if (!updated) return null;
    return mapToReview(updated.id, updated);
  }

  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.collection, id);
  }
}

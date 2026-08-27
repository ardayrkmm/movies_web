import { ReviewsRepository } from "./reviews.repository";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { MoviesRepository } from "@/lib/modules/movies/movies.repository";
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from "@/lib/api/errors";
import type { Review, CreateReviewInput, UpdateReviewInput, ReviewWithUser } from "./reviews.types";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import type { PaginatedResult } from "@/lib/firebase/firestore-helpers";

export class ReviewsService {
  private repo = new ReviewsRepository();
  private reservationsRepo = new ReservationsRepository();
  private moviesRepo = new MoviesRepository();

  async createReview(userId: string, input: CreateReviewInput): Promise<Review> {
    const { movieId, reservationId, rating, comment } = input;

    // 1. Verify movie exists
    const movie = await this.moviesRepo.findById(movieId);
    if (!movie) throw new NotFoundError("Movie not found");

    // 2. Verify reservation
    const reservation = await this.reservationsRepo.findWithItems(reservationId);
    if (!reservation) throw new NotFoundError("Reservation not found");
    
    // - belongs to user
    if (reservation.userId !== userId) {
        throw new ForbiddenError("Not authorized to review based on this reservation");
    }
    // - points to this movie
    if (reservation.showtimeId) {
        const db = getFirestore();
        const showtimeSnap = await db.collection(COLLECTIONS.SHOWTIMES).doc(reservation.showtimeId).get();
        if (showtimeSnap.exists && showtimeSnap.data()?.movieId !== movieId) {
            throw new BadRequestError("Reservation does not match the movie");
        }
        
        // check if showtime is in the past
        if (showtimeSnap.exists) {
            const startAt = showtimeSnap.data()?.startAt?.toDate();
            if (startAt && startAt > new Date()) {
                throw new BadRequestError("Cannot review a movie before watching it");
            }
        }
    }
    
    // - status is PAID or CONFIRMED
    if (reservation.status !== 'PAID' && reservation.status !== 'CONFIRMED') {
        throw new BadRequestError("Only completed reservations can be used for reviews");
    }

    // 3. Verify no duplicate review
    const existing = await this.repo.findByUserAndMovie(userId, movieId);
    if (existing) {
        throw new ConflictError("You have already reviewed this movie");
    }

    // 4. Transaction: Create review + Update movie aggregate rating
    const db = getFirestore();
    
    return await db.runTransaction(async (tx) => {
        // Get movie doc inside tx
        const movieRef = db.collection(COLLECTIONS.MOVIES).doc(movieId);
        const movieSnap = await tx.get(movieRef);
        if (!movieSnap.exists) throw new NotFoundError("Movie not found");
        
        const mData = movieSnap.data()!;
        const currentCount = mData.reviewCount || 0;
        const currentRating = mData.rating || 0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        
        // Save review
        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
        const reviewData = {
            userId,
            movieId,
            reservationId,
            rating,
            comment: comment || null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };
        tx.set(reviewRef, reviewData);
        
        // Update movie
        tx.update(movieRef, {
            reviewCount: newCount,
            rating: newRating
        });
        
        const now = new Date().toISOString();
        return {
            id: reviewRef.id,
            ...reviewData,
            createdAt: now,
            updatedAt: now,
        } as Review;
    });
  }

  async getMovieReviews(movieId: string, page: number, limit: number): Promise<PaginatedResult<ReviewWithUser>> {
    // Make sure movie exists
    const movie = await this.moviesRepo.findById(movieId);
    if (!movie) throw new NotFoundError("Movie not found");

    const result = await this.repo.findByMovieId(movieId, page, limit);
    
    // Fetch user details for each review
    const db = getFirestore();
    const detailedItems = await Promise.all(result.items.map(async (review) => {
        const userSnap = await db.collection(COLLECTIONS.USERS).doc(review.userId).get();
        const userData = userSnap.data();
        
        return {
            ...review,
            user: {
                id: review.userId,
                name: userData?.name || "Unknown User",
                photoUrl: userData?.photoUrl,
            }
        };
    }));
    
    return {
        ...result,
        items: detailedItems,
    };
  }

  async updateReview(id: string, userId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await this.repo.findById(id);
    if (!review) throw new NotFoundError("Review not found");
    if (review.userId !== userId) throw new ForbiddenError("Not authorized to update this review");
    
    if (input.rating === undefined) {
        // Just update comment
        const updated = await this.repo.update(id, input);
        return updated!;
    }
    
    // If rating changed, we need a transaction to update movie average
    const db = getFirestore();
    return await db.runTransaction(async (tx) => {
        const movieRef = db.collection(COLLECTIONS.MOVIES).doc(review.movieId);
        const movieSnap = await tx.get(movieRef);
        if (movieSnap.exists) {
            const mData = movieSnap.data()!;
            const count = mData.reviewCount || 1;
            const currentAvg = mData.rating || 0;
            
            // Remove old rating, add new rating
            // newAvg = ( (currentAvg * count) - oldRating + newRating ) / count
            const oldRating = review.rating;
            const newRating = input.rating!;
            const sum = (currentAvg * count) - oldRating + newRating;
            const newAvg = sum / count;
            
            tx.update(movieRef, { rating: newAvg });
        }
        
        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc(id);
        const updateData: any = { ...input, updatedAt: FieldValue.serverTimestamp() };
        tx.update(reviewRef, updateData);
        
        return {
            ...review,
            ...input,
            updatedAt: new Date().toISOString()
        };
    });
  }

  async deleteReview(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.repo.findById(id);
    if (!review) throw new NotFoundError("Review not found");
    if (review.userId !== userId && userRole !== "ADMIN") {
        throw new ForbiddenError("Not authorized to delete this review");
    }
    
    // Transaction to update movie stats
    const db = getFirestore();
    await db.runTransaction(async (tx) => {
        const movieRef = db.collection(COLLECTIONS.MOVIES).doc(review.movieId);
        const movieSnap = await tx.get(movieRef);
        if (movieSnap.exists) {
            const mData = movieSnap.data()!;
            const count = mData.reviewCount || 1;
            const currentAvg = mData.rating || 0;
            
            const newCount = Math.max(0, count - 1);
            let newAvg = 0;
            if (newCount > 0) {
                newAvg = ((currentAvg * count) - review.rating) / newCount;
            }
            
            tx.update(movieRef, {
                reviewCount: newCount,
                rating: newAvg
            });
        }
        
        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc(id);
        tx.delete(reviewRef);
    });
  }
}

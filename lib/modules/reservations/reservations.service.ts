import { ReservationsRepository, BLOCKING_STATUSES } from "./reservations.repository";
import { ShowtimesRepository } from "@/lib/modules/showtimes/showtimes.repository";
import { SeatsRepository } from "@/lib/modules/seats/seats.repository";
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from "@/lib/api/errors";
import type { Reservation, ReservationWithItems, ReservationStatus, CreateReservationInput } from "./reservations.types";
import { getFirestore } from "firebase-admin/firestore";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { PaginatedResult } from "@/lib/firebase/firestore-helpers";

const RESERVATION_EXPIRY_MINUTES = 15;

function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class ReservationsService {
  private repo = new ReservationsRepository();
  private showtimesRepo = new ShowtimesRepository();
  private seatsRepo = new SeatsRepository();

  async createReservation(userId: string, input: CreateReservationInput): Promise<ReservationWithItems> {
    const showtime = await this.showtimesRepo.findById(input.showtimeId);
    if (!showtime) throw new NotFoundError('Showtime not found');
    if (showtime.status === 'CANCELLED') throw new BadRequestError('Showtime is cancelled');
    if (showtime.status === 'COMPLETED') throw new BadRequestError('Showtime has already ended');
    if (new Date(showtime.startAt) < new Date()) throw new BadRequestError('Showtime has already started');
    
    const seats = await this.seatsRepo.findManyByIds(input.seatIds);
    if (seats.length !== input.seatIds.length) throw new NotFoundError('One or more seats not found');
    
    const invalidSeats = seats.filter(s => s.studioId !== showtime.studioId);
    if (invalidSeats.length > 0) throw new BadRequestError('One or more seats do not belong to this showtime studio');
    
    const inactiveSeats = seats.filter(s => s.status === 'INACTIVE');
    if (inactiveSeats.length > 0) throw new BadRequestError('One or more seats are not available');
    
    const db = getFirestore();
    
    return await db.runTransaction(async (tx) => {
      // Re-check seat availability inside transaction
      const reservationsSnap = await tx.get(
          db.collection('reservations')
          .where('showtimeId', '==', input.showtimeId)
          .where('status', 'in', BLOCKING_STATUSES)
      );
      
      const existingReservationIds = reservationsSnap.docs.map(d => d.id);
      const bookedSeatIds = new Set<string>();
      
      if (existingReservationIds.length > 0) {
        // Can't easily batch inside transaction for subcollections with 'in', 
        // so we just query items normally.
        const chunks = [];
        for (let i = 0; i < existingReservationIds.length; i += 30) {
          chunks.push(existingReservationIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
          const itemsSnap = await tx.get(
              db.collection('reservation_items').where('reservationId', 'in', chunk)
          );
          itemsSnap.docs.forEach(d => bookedSeatIds.add(d.data().seatId));
        }
      }
      
      const conflictSeats = input.seatIds.filter(id => bookedSeatIds.has(id));
      if (conflictSeats.length > 0) {
        throw new ConflictError('One or more seats are already booked');
      }
      
      const items = seats.map(seat => ({
        seatId: seat.id,
        seatLabel: seat.label,
        price: Math.round(showtime.basePrice * seat.priceModifier),
      }));
      const subtotal = items.reduce((sum, item) => sum + item.price, 0);
      
      const reservationRef = db.collection('reservations').doc();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + RESERVATION_EXPIRY_MINUTES);
      
      const reservationData = {
        userId,
        showtimeId: input.showtimeId,
        bookingCode: generateBookingCode(),
        status: 'PENDING' as ReservationStatus,
        subtotal,
        discount: 0,
        total: subtotal,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      tx.set(reservationRef, reservationData);
      
      const itemRefs = items.map(item => {
        const itemRef = db.collection('reservation_items').doc();
        tx.set(itemRef, {
          reservationId: reservationRef.id,
          seatId: item.seatId,
          seatLabel: item.seatLabel,
          price: item.price,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        return { ref: itemRef, ...item };
      });
      
      const now = new Date().toISOString();
      return {
        id: reservationRef.id,
        userId,
        showtimeId: input.showtimeId,
        bookingCode: reservationData.bookingCode,
        status: 'PENDING',
        subtotal,
        discount: 0,
        total: subtotal,
        expiresAt: expiresAt.toISOString(),
        createdAt: now,
        updatedAt: now,
        items: itemRefs.map(({ ref, seatId, seatLabel, price }) => ({
          id: ref.id,
          reservationId: reservationRef.id,
          seatId,
          seatLabel,
          price,
        })),
      };
    });
  }

  async listUserReservations(userId: string, page: number, limit: number): Promise<PaginatedResult<Reservation>> {
    return this.repo.findByUserId(userId, page, limit);
  }

  async getUserBookingHistory(userId: string, statusFilter?: ReservationStatus, dateFilter?: string, page: number = 1, limit: number = 10) {
    const db = getFirestore();
    let query = db.collection('reservations').where("userId", "==", userId);
    
    if (statusFilter) {
        query = query.where("status", "==", statusFilter);
    }
    
    // Simplistic pagination & ordering
    query = query.orderBy("createdAt", "desc").limit(limit).offset((page - 1) * limit);
    
    const snap = await query.get();
    
    // Also get count
    let countQuery = db.collection('reservations').where("userId", "==", userId);
    if (statusFilter) {
        countQuery = countQuery.where("status", "==", statusFilter);
    }
    const countSnap = await countQuery.count().get();
    const total = countSnap.data().count;
    
    const reservations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Fetch details for each reservation
    const detailed = await Promise.all(reservations.map(async (res) => {
        // Fetch items
        const itemsSnap = await db.collection('reservation_items').where("reservationId", "==", res.id).get();
        const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Fetch showtime
        const showtimeSnap = await db.collection('showtimes').doc(res.showtimeId).get();
        const showtime = showtimeSnap.exists ? { id: showtimeSnap.id, ...showtimeSnap.data() } as any : null;
        
        let movie = null, cinema = null, studio = null;
        if (showtime) {
            const movieSnap = await db.collection('movies').doc(showtime.movieId).get();
            movie = movieSnap.exists ? { id: movieSnap.id, title: movieSnap.data()?.title, posterUrl: movieSnap.data()?.posterUrl } : null;
            
            const cinemaSnap = await db.collection('cinemas').doc(showtime.cinemaId).get();
            cinema = cinemaSnap.exists ? { id: cinemaSnap.id, name: cinemaSnap.data()?.name, city: cinemaSnap.data()?.city } : null;
            
            const studioSnap = await db.collection('studios').doc(showtime.studioId).get();
            studio = studioSnap.exists ? { id: studioSnap.id, name: studioSnap.data()?.name, type: studioSnap.data()?.type } : null;
        }
        
        return {
            id: res.id,
            bookingCode: res.bookingCode,
            status: res.status,
            subtotal: res.subtotal,
            total: res.total,
            createdAt: res.createdAt?.toDate ? res.createdAt.toDate().toISOString() : res.createdAt,
            showtime: showtime ? {
                id: showtime.id,
                startAt: showtime.startAt?.toDate ? showtime.startAt.toDate().toISOString() : showtime.startAt,
                status: showtime.status
            } : null,
            movie,
            cinema,
            studio,
            items: items.map(i => ({ seatLabel: (i as any).seatLabel, price: (i as any).price })),
        };
    }));

    return {
        items: detailed,
        total,
        page,
        limit
    };
  }

  async getReservationById(id: string, userId: string, userRole: string): Promise<any> {
    const reservation = await this.repo.findWithItems(id);
    if (!reservation) throw new NotFoundError("Reservation not found");
    if (reservation.userId !== userId && userRole !== "ADMIN") {
        throw new ForbiddenError("Access denied to this reservation");
    }

    const db = getFirestore();
    const showtimeSnap = await db.collection('showtimes').doc(reservation.showtimeId).get();
    const showtime = showtimeSnap.exists ? { id: showtimeSnap.id, ...showtimeSnap.data() } as any : null;
    
    let movie = null, cinema = null, studio = null;
    if (showtime) {
        const movieSnap = await db.collection('movies').doc(showtime.movieId).get();
        movie = movieSnap.exists ? { id: movieSnap.id, title: movieSnap.data()?.title, posterUrl: movieSnap.data()?.posterUrl } : null;
        
        const cinemaSnap = await db.collection('cinemas').doc(showtime.cinemaId).get();
        cinema = cinemaSnap.exists ? { id: cinemaSnap.id, name: cinemaSnap.data()?.name, city: cinemaSnap.data()?.city } : null;
        
        const studioSnap = await db.collection('studios').doc(showtime.studioId).get();
        studio = studioSnap.exists ? { id: studioSnap.id, name: studioSnap.data()?.name, type: studioSnap.data()?.type } : null;
    }

    return {
        ...reservation,
        showtime: showtime ? {
            id: showtime.id,
            startAt: showtime.startAt?.toDate ? showtime.startAt.toDate().toISOString() : showtime.startAt,
            status: showtime.status
        } : null,
        movie,
        cinema,
        studio,
    };
  }

  async cancelReservation(id: string, userId: string, userRole: string): Promise<Reservation> {
    const reservation = await this.getReservationById(id, userId, userRole);
    if (reservation.status !== 'PENDING' && reservation.status !== 'PAID') {
        throw new BadRequestError(`Cannot cancel reservation in ${reservation.status} status`);
    }
    const updated = await this.repo.updateStatus(id, 'CANCELLED');
    return updated!;
  }
}

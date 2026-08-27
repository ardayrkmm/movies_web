import { COLLECTIONS, getFirestore } from '@/lib/firebase/firestore'
import {
  getDocument,
  updateDocument,
  getPaginatedCollection,
  type PaginatedResult,
} from '@/lib/firebase/firestore-helpers'
import { Timestamp } from 'firebase-admin/firestore'
import type { Reservation, ReservationItem, ReservationWithItems, ReservationStatus } from './reservations.types'

export const BLOCKING_STATUSES: ReservationStatus[] = ['PENDING', 'PAID', 'CONFIRMED']

function mapToReservation(id: string, data: any): Reservation {
  return {
    id,
    userId: data.userId,
    showtimeId: data.showtimeId,
    bookingCode: data.bookingCode,
    status: data.status,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : data.expiresAt,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  }
}

function mapToItem(id: string, data: any): ReservationItem {
  return {
    id,
    reservationId: data.reservationId,
    seatId: data.seatId,
    seatLabel: data.seatLabel,
    price: data.price,
  }
}

export class ReservationsRepository {
  private collection = COLLECTIONS.RESERVATIONS;
  private itemsCollection = COLLECTIONS.RESERVATION_ITEMS;

  async findById(id: string): Promise<Reservation | null> {
    const doc = await getDocument<any>(this.collection, id);
    if (!doc) return null;
    return mapToReservation(doc.id, doc);
  }

  async findWithItems(id: string): Promise<ReservationWithItems | null> {
    const reservation = await this.findById(id);
    if (!reservation) return null;

    const db = getFirestore();
    const snap = await db.collection(this.itemsCollection).where("reservationId", "==", id).get();
    
    const items = snap.docs.map(doc => mapToItem(doc.id, doc.data()));

    return { ...reservation, items };
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<Reservation>> {
    const result = await getPaginatedCollection<any>(this.collection, {
      where: [["userId", "==", userId]],
      orderBy: [["createdAt", "desc"]],
      page,
      limit,
    });
    
    return {
      ...result,
      items: result.items.map(item => mapToReservation(item.id, item))
    };
  }

  async findByShowtimeId(showtimeId: string): Promise<Reservation[]> {
    const db = getFirestore();
    const snap = await db.collection(this.collection).where("showtimeId", "==", showtimeId).get();
    return snap.docs.map(doc => mapToReservation(doc.id, doc.data()));
  }

  async getBookedSeatIds(showtimeId: string): Promise<Set<string>> {
    const db = getFirestore();
    const reservationsSnap = await db.collection(this.collection)
      .where("showtimeId", "==", showtimeId)
      .where("status", "in", BLOCKING_STATUSES)
      .get();
    
    const existingReservationIds = reservationsSnap.docs.map(d => d.id);
    const bookedSeatIds = new Set<string>();
    
    if (existingReservationIds.length > 0) {
      const chunks = [];
      for (let i = 0; i < existingReservationIds.length; i += 30) {
        chunks.push(existingReservationIds.slice(i, i + 30));
      }
      for (const chunk of chunks) {
        const itemsSnap = await db.collection(this.itemsCollection)
          .where("reservationId", "in", chunk)
          .get();
        itemsSnap.docs.forEach(d => bookedSeatIds.add(d.data().seatId));
      }
    }
    
    return bookedSeatIds;
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    const updated = await updateDocument<any>(this.collection, id, { status });
    if (!updated) return null;
    return mapToReservation(updated.id, updated);
  }
}

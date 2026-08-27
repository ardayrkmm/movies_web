/**
 * Reservations — Domain Types
 */

export type ReservationStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

/** Status reservasi yang memblokir seat (seat tidak bisa dipesan lagi) */
export const BLOCKING_STATUSES: ReservationStatus[] = [
  "PENDING",
  "PAID",
  "CONFIRMED",
];

export interface Reservation {
  id: string;
  userId: string;
  showtimeId: string;
  bookingCode: string;
  status: ReservationStatus;
  subtotal: number;
  discount: number;
  total: number;
  expiresAt: string; // ISO datetime — PENDING reservations expire after this
  createdAt: string;
  updatedAt: string;
}

export interface ReservationItem {
  id: string;
  reservationId: string;
  seatId: string;
  seatLabel: string;
  price: number;
}

export interface ReservationWithItems extends Reservation {
  items: ReservationItem[];
}

export interface CreateReservationInput {
  showtimeId: string;
  seatIds: string[];
}

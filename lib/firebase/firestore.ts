/**
 * Firestore Instance Helper — Extended
 *
 * COLLECTIONS mencakup semua collection yang digunakan sistem.
 */

import { getFirestore as _getFirestore, type Firestore } from "firebase-admin/firestore";
import getFirebaseAdmin from "@/lib/firebase/admin";

export function getFirestore(): Firestore {
  const app = getFirebaseAdmin();
  return _getFirestore(app);
}

export const COLLECTIONS = {
  USERS: "users",
  MOVIES: "movies",
  GENRES: "genres",
  CINEMAS: "cinemas",
  STUDIOS: "studios",
  SEATS: "seats",
  SHOWTIMES: "showtimes",
  RESERVATIONS: "reservations",
  RESERVATION_ITEMS: "reservation_items",
  PAYMENTS: "payments",
  REVIEWS: "reviews",
  NOTIFICATIONS: "notifications",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

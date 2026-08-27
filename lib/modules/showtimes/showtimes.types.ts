/**
 * Showtimes — Domain Types
 */

export type ShowtimeStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  studioId: string;
  startAt: string;    // ISO datetime string
  endAt: string;      // ISO datetime string
  basePrice: number;  // base price in smallest currency unit (e.g., IDR)
  status: ShowtimeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShowtimeWithDetails extends Showtime {
  movie?: { id: string; title: string; posterUrl?: string; duration: number };
  cinema?: { id: string; name: string; city: string };
  studio?: { id: string; name: string; type: string };
}

export interface CreateShowtimeInput {
  movieId: string;
  cinemaId: string;
  studioId: string;
  startAt: string;
  basePrice: number;
}

export interface UpdateShowtimeInput {
  startAt?: string;
  basePrice?: number;
  status?: ShowtimeStatus;
}

export interface ShowtimeFilters {
  movieId?: string;
  cinemaId?: string;
  date?: string;   // YYYY-MM-DD
  city?: string;
  status?: ShowtimeStatus;
}

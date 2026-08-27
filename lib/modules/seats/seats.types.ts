/**
 * Seats — Domain Types
 */

export type SeatType = "REGULAR" | "VIP" | "DISABLED";
export type SeatStatus = "AVAILABLE" | "INACTIVE";

export interface Seat {
  id: string;
  studioId: string;
  row: string;    // e.g., "A", "B", "C"
  number: number; // e.g., 1, 2, 3
  label: string;  // e.g., "A1", "B3"
  type: SeatType;
  priceModifier: number; // multiplier: 1.0 = no change, 1.5 = 50% extra
  status: SeatStatus;
  createdAt: string;
  updatedAt: string;
}

/** Seat dengan availability untuk showtime tertentu */
export interface SeatWithAvailability extends Seat {
  price: number;
  availability: "AVAILABLE" | "BOOKED";
}

export interface CreateSeatInput {
  studioId: string;
  row: string;
  number: number;
  label: string;
  type: SeatType;
  priceModifier?: number;
}

export interface UpdateSeatInput {
  type?: SeatType;
  priceModifier?: number;
  status?: SeatStatus;
}

export interface BulkCreateSeatsInput {
  studioId: string;
  rows: string[];        // e.g., ["A", "B", "C"]
  seatsPerRow: number;   // e.g., 10
  type?: SeatType;
  priceModifier?: number;
}

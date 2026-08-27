/**
 * Studios — Domain Types
 */

export type StudioType = "REGULAR" | "VIP" | "IMAX" | "PREMIERE";

export interface Studio {
  id: string;
  cinemaId: string;
  name: string;
  type: StudioType;
  totalSeats: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudioInput {
  cinemaId: string;
  name: string;
  type: StudioType;
  totalSeats: number;
}

export interface UpdateStudioInput {
  name?: string;
  type?: StudioType;
  totalSeats?: number;
  isActive?: boolean;
}

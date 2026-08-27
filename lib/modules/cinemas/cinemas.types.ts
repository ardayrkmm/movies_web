/**
 * Cinemas — Domain Types
 */

export interface Cinema {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCinemaInput {
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCinemaInput {
  name?: string;
  slug?: string;
  description?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface CinemaFilters {
  city?: string;
  search?: string;
  isActive?: boolean;
}

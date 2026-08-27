/**
 * Movies — Domain Types
 */

export type MovieStatus = "UPCOMING" | "NOW_SHOWING" | "ENDED";
export type AgeRating = "G" | "PG" | "PG-13" | "R" | "NC-17" | "SU" | "13+" | "17+" | "21+";

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  duration: number; // in minutes
  releaseDate: string; // ISO date string
  ageRating: string;
  language: string;
  status: MovieStatus;
  genres: string[]; // array of genre IDs
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieInput {
  title: string;
  slug: string;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  duration: number;
  releaseDate: string;
  ageRating: string;
  language: string;
  status: MovieStatus;
  genres: string[];
}

export interface UpdateMovieInput {
  title?: string;
  slug?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  duration?: number;
  releaseDate?: string;
  ageRating?: string;
  language?: string;
  status?: MovieStatus;
  genres?: string[];
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  status?: MovieStatus;
  ageRating?: string;
  sortBy?: "newest" | "releaseDate" | "title";
  sortOrder?: "asc" | "desc";
}

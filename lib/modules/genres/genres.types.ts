/**
 * Genres — Domain Types
 */

export interface Genre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGenreInput {
  name: string;
  slug: string;
}

export interface UpdateGenreInput {
  name?: string;
  slug?: string;
}

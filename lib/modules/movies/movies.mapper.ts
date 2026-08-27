/**
 * Movies — Mapper
 *
 * Konversi Firestore DocumentData ke Movie domain object.
 */

import { timestampToIso } from '@/lib/firebase/firestore-helpers'
import type { Movie } from '@/lib/modules/movies/movies.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMovie(doc: any): Movie {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    posterUrl: doc.posterUrl ?? undefined,
    backdropUrl: doc.backdropUrl ?? undefined,
    trailerUrl: doc.trailerUrl ?? undefined,
    duration: doc.duration,
    releaseDate: doc.releaseDate,
    ageRating: doc.ageRating,
    language: doc.language,
    status: doc.status,
    genres: Array.isArray(doc.genres) ? doc.genres : [],
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    createdAt: timestampToIso(doc.createdAt) ?? new Date(0).toISOString(),
    updatedAt: timestampToIso(doc.updatedAt) ?? new Date(0).toISOString(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMovieList(docs: any[]): Movie[] {
  return docs.map(mapMovie)
}

/**
 * Movies — Repository
 *
 * Data access layer untuk koleksi movies di Firestore.
 */

import {
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  findOneByField,
  getPaginatedCollection,
} from '@/lib/firebase/firestore-helpers'
import { COLLECTIONS, getFirestore } from '@/lib/firebase/firestore'
import type { PaginatedResult } from '@/lib/firebase/firestore-helpers'
import type { Movie, MovieStatus } from '@/lib/modules/movies/movies.types'
import type {
  CreateMovieInput,
  UpdateMovieInput,
  MovieFiltersInput,
} from '@/lib/modules/movies/movies.schema'
import { mapMovie, mapMovieList } from '@/lib/modules/movies/movies.mapper'


// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class MoviesRepository {
  private readonly col = COLLECTIONS.MOVIES

  /** Mengambil semua movie dengan filter & pagination. */
  async findAll(
    options: MovieFiltersInput
  ): Promise<PaginatedResult<Movie>> {
    const { search, genre, status, ageRating, sortBy, sortOrder, page, limit } =
      options

    // Build where clauses — Firestore only allows equality/array-contains filters
    const where: Array<[string, FirebaseFirestore.WhereFilterOp, unknown]> = []

    if (status) {
      where.push(['status', '==', status])
    }

    if (genre) {
      where.push(['genres', 'array-contains', genre])
    }

    if (ageRating) {
      where.push(['ageRating', '==', ageRating])
    }

    // Determine orderBy field
    let orderByField = 'createdAt'
    if (sortBy === 'releaseDate') orderByField = 'releaseDate'
    else if (sortBy === 'title') orderByField = 'title'

    const result = await getPaginatedCollection<Record<string, unknown>>(
      this.col,
      {
        where,
        orderBy: [[orderByField, sortOrder as 'asc' | 'desc']],
        page,
        limit,
      }
    )

    // Client-side search filter (Firestore doesn't support native text search)
    let items = mapMovieList(result.items)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((m) => m.title.toLowerCase().includes(q))
    }

    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  }

  /** Mengambil movie berdasarkan ID. */
  async findById(id: string): Promise<Movie | null> {
    const doc = await getDocument<Record<string, unknown>>(this.col, id)
    if (!doc) return null
    return mapMovie(doc)
  }

  /** Mengambil movie berdasarkan slug. */
  async findBySlug(slug: string): Promise<Movie | null> {
    const doc = await findOneByField<Record<string, unknown>>(
      this.col,
      'slug',
      slug
    )
    if (!doc) return null
    return mapMovie(doc)
  }

  /** Mengambil movie berdasarkan status dengan pagination. */
  async findByStatus(
    status: MovieStatus,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Movie>> {
    const result = await getPaginatedCollection<Record<string, unknown>>(
      this.col,
      {
        where: [['status', '==', status]],
        orderBy: [['releaseDate', 'desc']],
        page,
        limit,
      }
    )
    return {
      items: mapMovieList(result.items),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  }

  /** Membuat movie baru. */
  async create(input: CreateMovieInput): Promise<Movie> {
    const doc = await createDocument(this.col, { ...input })
    return mapMovie(doc)
  }

  /** Mengupdate movie. Mengembalikan null jika tidak ditemukan. */
  async update(id: string, input: UpdateMovieInput): Promise<Movie | null> {
    const doc = await updateDocument<Record<string, unknown>>(
      this.col,
      id,
      input as Record<string, unknown>
    )
    if (!doc) return null
    return mapMovie(doc)
  }

  /** Menghapus movie. */
  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.col, id)
  }

  /**
   * Mengecek apakah ada reservation untuk movie ini.
   * Cek dilakukan via showtimes collection yang memiliki movieId.
   */
  async hasReservations(movieId: string): Promise<boolean> {
    const db = getFirestore()
    // Cari showtime yang memiliki movieId ini
    const showtimeSnap = await db
      .collection(COLLECTIONS.SHOWTIMES)
      .where('movieId', '==', movieId)
      .limit(1)
      .get()

    if (showtimeSnap.empty) return false

    // Cek apakah ada reservation di salah satu showtime tersebut
    const showtimeId = showtimeSnap.docs[0]!.id
    const reservationSnap = await db
      .collection(COLLECTIONS.RESERVATIONS)
      .where('showtimeId', '==', showtimeId)
      .limit(1)
      .get()

    return !reservationSnap.empty
  }
}

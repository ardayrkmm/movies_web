/**
 * Movies — Service
 *
 * Business logic layer untuk operasi movies.
 */

import { NotFoundError, ConflictError, BadRequestError } from '@/lib/api/errors'
import { MoviesRepository } from '@/lib/modules/movies/movies.repository'
import { GenresRepository } from '@/lib/modules/genres/genres.repository'
import type { PaginatedResult } from '@/lib/firebase/firestore-helpers'
import type { Movie, MovieStatus } from '@/lib/modules/movies/movies.types'
import type { Genre } from '@/lib/modules/genres/genres.types'
import type {
  CreateMovieInput,
  UpdateMovieInput,
  MovieFiltersInput,
} from '@/lib/modules/movies/movies.schema'

export class MoviesService {
  private readonly repo: MoviesRepository
  private readonly genresRepo: GenresRepository

  constructor(repo?: MoviesRepository, genresRepo?: GenresRepository) {
    this.repo = repo ?? new MoviesRepository()
    this.genresRepo = genresRepo ?? new GenresRepository()
  }

  /** Mengembalikan daftar movie dengan filter & pagination. */
  async listMovies(filters: MovieFiltersInput): Promise<PaginatedResult<Movie>> {
    return this.repo.findAll(filters)
  }

  /** Mengembalikan movie berdasarkan ID. Melempar NotFoundError jika tidak ada. */
  async getMovieById(id: string): Promise<Movie> {
    const movie = await this.repo.findById(id)
    if (!movie) throw new NotFoundError(`Movie with id '${id}' not found`)
    return movie
  }

  /** Mengembalikan movie berdasarkan slug. Melempar NotFoundError jika tidak ada. */
  async getMovieBySlug(slug: string): Promise<Movie> {
    const movie = await this.repo.findBySlug(slug)
    if (!movie) throw new NotFoundError(`Movie with slug '${slug}' not found`)
    return movie
  }

  /** Mengembalikan movie yang NOW_SHOWING dengan pagination. */
  async getNowShowing(page: number, limit: number): Promise<PaginatedResult<Movie>> {
    return this.repo.findByStatus('NOW_SHOWING' as MovieStatus, page, limit)
  }

  /** Mengembalikan movie yang UPCOMING dengan pagination. */
  async getUpcoming(page: number, limit: number): Promise<PaginatedResult<Movie>> {
    return this.repo.findByStatus('UPCOMING' as MovieStatus, page, limit)
  }

  /**
   * Mengembalikan genre-genre dari sebuah movie.
   * Melempar NotFoundError jika movie tidak ada.
   */
  async getMovieGenres(movieId: string): Promise<Genre[]> {
    const movie = await this.getMovieById(movieId)
    return this.genresRepo.findManyByIds(movie.genres)
  }

  /** Membuat movie baru. Validasi semua genre IDs & cek slug duplikat. */
  async createMovie(input: CreateMovieInput): Promise<Movie> {
    // Validasi genre IDs
    await this.validateGenreIds(input.genres)

    // Cek slug duplikat
    const slugExists = await this.repo.findBySlug(input.slug)
    if (slugExists) {
      throw new ConflictError(`Movie with slug '${input.slug}' already exists`)
    }

    return this.repo.create(input)
  }

  /** Mengupdate movie. */
  async updateMovie(id: string, input: UpdateMovieInput): Promise<Movie> {
    const movie = await this.repo.findById(id)
    if (!movie) throw new NotFoundError(`Movie with id '${id}' not found`)

    // Validasi genre IDs jika genres berubah
    if (input.genres && input.genres.length > 0) {
      await this.validateGenreIds(input.genres)
    }

    // Cek slug duplikat hanya jika slug berubah
    if (input.slug && input.slug !== movie.slug) {
      const slugExists = await this.repo.findBySlug(input.slug)
      if (slugExists) {
        throw new ConflictError(`Movie with slug '${input.slug}' already exists`)
      }
    }

    const updated = await this.repo.update(id, input)
    return updated!
  }

  /** Menghapus movie. Melempar ConflictError jika ada reservasi. */
  async deleteMovie(id: string): Promise<void> {
    const movie = await this.repo.findById(id)
    if (!movie) throw new NotFoundError(`Movie with id '${id}' not found`)

    const hasReservations = await this.repo.hasReservations(id)
    if (hasReservations) {
      throw new ConflictError(
        'Cannot delete movie with existing reservations. Set status to ENDED instead.'
      )
    }

    await this.repo.delete(id)
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Memvalidasi bahwa semua genre IDs exist di Firestore. */
  private async validateGenreIds(ids: string[]): Promise<void> {
    const genres = await this.genresRepo.findManyByIds(ids)
    if (genres.length !== ids.length) {
      const foundIds = new Set(genres.map((g) => g.id))
      const missing = ids.filter((id) => !foundIds.has(id))
      throw new BadRequestError(
        `The following genre IDs do not exist: ${missing.join(', ')}`
      )
    }
  }
}

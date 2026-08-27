/**
 * Genres — Service
 *
 * Business logic layer untuk operasi genres.
 */

import { NotFoundError, ConflictError } from '@/lib/api/errors'
import { GenresRepository } from '@/lib/modules/genres/genres.repository'
import type { Genre } from '@/lib/modules/genres/genres.types'
import type {
  CreateGenreInput,
  UpdateGenreInput,
} from '@/lib/modules/genres/genres.schema'

export class GenresService {
  private readonly repo: GenresRepository

  constructor(repo?: GenresRepository) {
    this.repo = repo ?? new GenresRepository()
  }

  /** Mengembalikan semua genre. */
  async listGenres(): Promise<Genre[]> {
    return this.repo.findAll()
  }

  /** Mengembalikan genre berdasarkan ID. Melempar NotFoundError jika tidak ada. */
  async getGenreById(id: string): Promise<Genre> {
    const genre = await this.repo.findById(id)
    if (!genre) throw new NotFoundError(`Genre with id '${id}' not found`)
    return genre
  }

  /** Membuat genre baru. Melempar ConflictError jika slug sudah ada. */
  async createGenre(input: CreateGenreInput): Promise<Genre> {
    const existing = await this.repo.findBySlug(input.slug)
    if (existing) {
      throw new ConflictError(`Genre with slug '${input.slug}' already exists`)
    }
    return this.repo.create(input)
  }

  /** Mengupdate genre. Melempar NotFoundError jika tidak ada. */
  async updateGenre(id: string, input: UpdateGenreInput): Promise<Genre> {
    const genre = await this.repo.findById(id)
    if (!genre) throw new NotFoundError(`Genre with id '${id}' not found`)

    // Cek slug duplikat hanya jika slug berubah
    if (input.slug && input.slug !== genre.slug) {
      const slugExists = await this.repo.findBySlug(input.slug)
      if (slugExists) {
        throw new ConflictError(`Genre with slug '${input.slug}' already exists`)
      }
    }

    const updated = await this.repo.update(id, input)
    // update akan selalu berhasil karena kita sudah cek exist di atas
    return updated!
  }

  /** Menghapus genre. Melempar NotFoundError jika tidak ada. */
  async deleteGenre(id: string): Promise<void> {
    const genre = await this.repo.findById(id)
    if (!genre) throw new NotFoundError(`Genre with id '${id}' not found`)
    await this.repo.delete(id)
  }
}

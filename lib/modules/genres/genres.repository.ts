/**
 * Genres — Repository
 *
 * Data access layer untuk koleksi genres di Firestore.
 */

import {
  getCollection,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  findOneByField,
  timestampToIso,
} from '@/lib/firebase/firestore-helpers'
import { COLLECTIONS } from '@/lib/firebase/firestore'
import type { Genre } from '@/lib/modules/genres/genres.types'
import type {
  CreateGenreInput,
  UpdateGenreInput,
} from '@/lib/modules/genres/genres.schema'

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGenre(doc: any): Genre {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    createdAt: timestampToIso(doc.createdAt) ?? new Date(0).toISOString(),
    updatedAt: timestampToIso(doc.updatedAt) ?? new Date(0).toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class GenresRepository {
  private readonly col = COLLECTIONS.GENRES

  /** Mengambil semua genre, diurutkan berdasarkan name ascending. */
  async findAll(): Promise<Genre[]> {
    const docs = await getCollection(this.col, {
      orderBy: [['name', 'asc']],
    })
    return docs.map(mapGenre)
  }

  /** Mengambil genre berdasarkan ID. */
  async findById(id: string): Promise<Genre | null> {
    const doc = await getDocument(this.col, id)
    if (!doc) return null
    return mapGenre(doc)
  }

  /** Mengambil genre berdasarkan slug. */
  async findBySlug(slug: string): Promise<Genre | null> {
    const doc = await findOneByField(this.col, 'slug', slug)
    if (!doc) return null
    return mapGenre(doc)
  }

  /** Membuat genre baru. */
  async create(input: CreateGenreInput): Promise<Genre> {
    const doc = await createDocument(this.col, {
      name: input.name,
      slug: input.slug,
    })
    return mapGenre(doc)
  }

  /** Mengupdate genre. Mengembalikan null jika tidak ditemukan. */
  async update(id: string, input: UpdateGenreInput): Promise<Genre | null> {
    const doc = await updateDocument(this.col, id, input)
    if (!doc) return null
    return mapGenre(doc)
  }

  /** Menghapus genre. Mengembalikan true jika berhasil. */
  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.col, id)
  }

  /** Mengambil banyak genre berdasarkan array of IDs. */
  async findManyByIds(ids: string[]): Promise<Genre[]> {
    if (ids.length === 0) return []
    // Firestore tidak support where-in untuk lebih dari 30 items, tapi kita
    // gunakan parallel fetch untuk fleksibilitas.
    const results = await Promise.all(ids.map((id) => this.findById(id)))
    return results.filter((g): g is Genre => g !== null)
  }
}

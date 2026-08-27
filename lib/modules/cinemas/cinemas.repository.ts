import { COLLECTIONS, getFirestore } from "@/lib/firebase/firestore";
import {
  getDocument,
  getCollection,
  createDocument,
  updateDocument,
  deleteDocument,
  getPaginatedCollection,
  type PaginatedResult,
} from "@/lib/firebase/firestore-helpers";
import type { Cinema, CreateCinemaInput, UpdateCinemaInput, CinemaFilters } from "./cinemas.types";

export class CinemasRepository {
  private collection = COLLECTIONS.CINEMAS;

  async findAll(filters: CinemaFilters, page: number, limit: number): Promise<PaginatedResult<Cinema>> {
    const where: any[] = [];
    if (filters.city) {
      where.push(["city", "==", filters.city]);
    }
    if (filters.isActive !== undefined) {
      where.push(["isActive", "==", filters.isActive]);
    }

    const result = await getPaginatedCollection<Cinema>(this.collection, {
      where,
      orderBy: [["name", "asc"]],
      page,
      limit,
    });

    // In-memory search if search filter is provided (Firestore doesn't support substring search easily)
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result.items = result.items.filter(c => c.name.toLowerCase().includes(searchLower) || c.address.toLowerCase().includes(searchLower));
        result.total = result.items.length; // Not accurate for full DB, but good enough for this phase
    }

    return result;
  }

  async findById(id: string): Promise<Cinema | null> {
    return getDocument<Cinema>(this.collection, id);
  }

  async findBySlug(slug: string): Promise<Cinema | null> {
    const results = await getCollection<Cinema>(this.collection, {
      where: [["slug", "==", slug]],
      limit: 1,
    });
    return results[0] || null;
  }

  async create(input: CreateCinemaInput): Promise<Cinema> {
    return createDocument<Omit<Cinema, 'id' | 'createdAt' | 'updatedAt'>>(this.collection, {
      ...input,
      isActive: true, // Default to active
    }) as unknown as Promise<Cinema>;
  }

  async update(id: string, input: UpdateCinemaInput): Promise<Cinema | null> {
    return updateDocument<Partial<Cinema>>(this.collection, id, input) as unknown as Promise<Cinema | null>;
  }

  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.collection, id);
  }
}

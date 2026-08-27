import { COLLECTIONS } from "@/lib/firebase/firestore";
import {
  getDocument,
  getCollection,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore-helpers";
import type { Studio, CreateStudioInput, UpdateStudioInput } from "./studios.types";

export class StudiosRepository {
  private collection = COLLECTIONS.STUDIOS;

  async findById(id: string): Promise<Studio | null> {
    return getDocument<Studio>(this.collection, id);
  }

  async findByCinemaId(cinemaId: string): Promise<Studio[]> {
    return getCollection<Studio>(this.collection, {
      where: [["cinemaId", "==", cinemaId]],
      orderBy: [["name", "asc"]],
    });
  }

  async findByNameAndCinema(name: string, cinemaId: string): Promise<Studio | null> {
    const results = await getCollection<Studio>(this.collection, {
      where: [
        ["cinemaId", "==", cinemaId],
        ["name", "==", name],
      ],
      limit: 1,
    });
    return results[0] || null;
  }

  async create(input: CreateStudioInput): Promise<Studio> {
    return createDocument<Omit<Studio, 'id' | 'createdAt' | 'updatedAt'>>(this.collection, {
      ...input,
      isActive: true, // Default to active
    }) as unknown as Promise<Studio>;
  }

  async update(id: string, input: UpdateStudioInput): Promise<Studio | null> {
    return updateDocument<Partial<Studio>>(this.collection, id, input) as unknown as Promise<Studio | null>;
  }

  async delete(id: string): Promise<boolean> {
    return deleteDocument(this.collection, id);
  }
}

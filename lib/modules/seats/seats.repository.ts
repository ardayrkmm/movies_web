import { COLLECTIONS } from "@/lib/firebase/firestore";
import {
  getDocument,
  getCollection,
  createDocument,
  updateDocument,
  batchCreateDocuments,
} from "@/lib/firebase/firestore-helpers";
import type { Seat, CreateSeatInput, UpdateSeatInput } from "./seats.types";
import { getFirestore } from "firebase-admin/firestore";

export class SeatsRepository {
  private collection = COLLECTIONS.SEATS;

  async findById(id: string): Promise<Seat | null> {
    return getDocument<Seat>(this.collection, id);
  }

  async findByStudioId(studioId: string): Promise<Seat[]> {
    return getCollection<Seat>(this.collection, {
      where: [["studioId", "==", studioId]],
      orderBy: [
        ["row", "asc"],
        ["number", "asc"],
      ],
    });
  }

  async findByLabel(studioId: string, label: string): Promise<Seat | null> {
    const results = await getCollection<Seat>(this.collection, {
      where: [
        ["studioId", "==", studioId],
        ["label", "==", label],
      ],
      limit: 1,
    });
    return results[0] || null;
  }

  async findManyByIds(ids: string[]): Promise<Seat[]> {
    if (ids.length === 0) return [];
    
    const db = getFirestore();
    const chunks = [];
    
    // Firestore 'in' limit is 30
    for (let i = 0; i < ids.length; i += 30) {
      chunks.push(ids.slice(i, i + 30));
    }
    
    const results: Seat[] = [];
    for (const chunk of chunks) {
      const snap = await db.collection(this.collection).where('__name__', 'in', chunk).get();
      snap.docs.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() } as Seat);
      });
    }
    
    return results;
  }

  async create(input: CreateSeatInput): Promise<Seat> {
    return createDocument<Omit<Seat, 'id' | 'createdAt' | 'updatedAt'>>(this.collection, {
      ...input,
      priceModifier: input.priceModifier ?? 1.0,
      status: "AVAILABLE",
    }) as unknown as Promise<Seat>;
  }

  async bulkCreate(inputs: CreateSeatInput[]): Promise<string[]> {
    const dataToInsert = inputs.map(input => ({
      ...input,
      status: "AVAILABLE" as const,
    }));
    return batchCreateDocuments(this.collection, dataToInsert);
  }

  async update(id: string, input: UpdateSeatInput): Promise<Seat | null> {
    return updateDocument<Partial<Seat>>(this.collection, id, input) as unknown as Promise<Seat | null>;
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete
    const updated = await this.update(id, { status: "INACTIVE" });
    return !!updated;
  }
}

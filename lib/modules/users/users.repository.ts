/**
 * Users Repository — Movie Reservation System
 *
 * Operasi Firestore untuk collection 'users'.
 * Semua timestamp dikonversi ke ISO string sebelum dikembalikan.
 */

import {
  getDocument,
  createDocument,
  updateDocument,
  findOneByField,
  timestampToIso,
} from "@/lib/firebase/firestore-helpers";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/modules/users/users.types";
import type { Timestamp, FieldValue } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Raw Firestore shape (timestamps belum dikonversi)
// ---------------------------------------------------------------------------

interface RawUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// ---------------------------------------------------------------------------
// Mapper — raw document -> User domain type
// ---------------------------------------------------------------------------

function mapRawToUser(id: string, raw: RawUser): User {
  return {
    id,
    name: raw.name,
    email: raw.email,
    passwordHash: raw.passwordHash,
    role: raw.role,
    phone: raw.phone,
    photoUrl: raw.photoUrl,
    isActive: raw.isActive,
    createdAt: timestampToIso(raw.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(raw.updatedAt) ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class UsersRepository {
  private readonly collection = COLLECTIONS.USERS;

  /**
   * Mencari user berdasarkan ID dokumen.
   * Mengembalikan null jika tidak ditemukan.
   */
  async findById(id: string): Promise<User | null> {
    const doc = await getDocument<RawUser>(this.collection, id);
    if (!doc) return null;
    return mapRawToUser(doc.id, doc);
  }

  /**
   * Mencari user berdasarkan alamat email.
   * Mengembalikan null jika tidak ditemukan.
   */
  async findByEmail(email: string): Promise<User | null> {
    const doc = await findOneByField<RawUser>(this.collection, "email", email);
    if (!doc) return null;
    return mapRawToUser(doc.id, doc);
  }

  /**
   * Membuat user baru di Firestore.
   * Role default = 'USER' jika tidak disediakan.
   */
  async create(input: CreateUserInput): Promise<User> {
    const data = {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? ("USER" as const),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
      isActive: true,
    };
    const doc = await createDocument<typeof data>(this.collection, data);
    return mapRawToUser(doc.id, doc as unknown as RawUser);
  }

  /**
   * Mengupdate field user yang diberikan.
   * Mengembalikan null jika user tidak ditemukan.
   */
  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const doc = await updateDocument<RawUser>(this.collection, id, input);
    if (!doc) return null;
    return mapRawToUser(doc.id, doc);
  }
}

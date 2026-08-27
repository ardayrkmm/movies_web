/**
 * Firestore Generic CRUD Helpers — Movie Reservation System
 *
 * Helper functions generik untuk operasi Firestore yang digunakan oleh semua repository.
 * Semua timestamps dikembalikan sebagai ISO string untuk konsistensi API response.
 */

import {
  FieldValue,
  Timestamp,
  type Firestore,
  type DocumentReference,
  type DocumentData,
  type Query,
  type WhereFilterOp,
  type OrderByDirection,
} from "firebase-admin/firestore";
import { getFirestore } from "@/lib/firebase/firestore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimestampFields {
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface WithId {
  id: string;
}

export type FirestoreDocument<T> = T & WithId;

export interface QueryOptions {
  where?: Array<[string, WhereFilterOp, unknown]>;
  orderBy?: Array<[string, OrderByDirection?]>;
  limit?: number;
  offset?: number;
  startAfter?: DocumentData;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Timestamp Helpers
// ---------------------------------------------------------------------------

/**
 * Mengkonversi Firestore Timestamp ke ISO string.
 * Mengembalikan undefined jika null/undefined.
 */
export function timestampToIso(
  ts: Timestamp | FieldValue | null | undefined
): string | undefined {
  if (!ts) return undefined;
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return undefined;
}

/**
 * Server timestamp untuk dibuat saat insert.
 */
export const serverTimestamp = () => FieldValue.serverTimestamp();

// ---------------------------------------------------------------------------
// Document Converter
// ---------------------------------------------------------------------------

/**
 * Mengkonversi Firestore DocumentData ke object dengan id.
 */
function docToObject<T>(
  id: string,
  data: DocumentData
): FirestoreDocument<T> {
  return { id, ...data } as FirestoreDocument<T>;
}

// ---------------------------------------------------------------------------
// GET — Single Document
// ---------------------------------------------------------------------------

/**
 * Mengambil satu dokumen berdasarkan ID.
 * Mengembalikan null jika tidak ditemukan.
 */
export async function getDocument<T>(
  collection: string,
  id: string
): Promise<FirestoreDocument<T> | null> {
  const db: Firestore = getFirestore();
  const docRef = db.collection(collection).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) return null;
  return docToObject<T>(snap.id, snap.data()!);
}

// ---------------------------------------------------------------------------
// GET — Collection
// ---------------------------------------------------------------------------

/**
 * Mengambil semua dokumen dalam sebuah collection dengan optional query.
 */
export async function getCollection<T>(
  collection: string,
  options: QueryOptions = {}
): Promise<FirestoreDocument<T>[]> {
  const db: Firestore = getFirestore();
  let query: Query = db.collection(collection);

  if (options.where) {
    for (const [field, op, value] of options.where) {
      query = query.where(field, op, value);
    }
  }

  if (options.orderBy) {
    for (const [field, direction] of options.orderBy) {
      query = query.orderBy(field, direction ?? "asc");
    }
  }

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  if (options.offset !== undefined && options.offset > 0) {
    query = query.offset(options.offset);
  }

  const snap = await query.get();
  return snap.docs.map((doc) => docToObject<T>(doc.id, doc.data()));
}

// ---------------------------------------------------------------------------
// GET — Paginated Collection
// ---------------------------------------------------------------------------

/**
 * Mengambil koleksi dengan pagination.
 * Total count menggunakan count() aggregation query.
 */
export async function getPaginatedCollection<T>(
  collection: string,
  options: QueryOptions & PaginationOptions
): Promise<PaginatedResult<T>> {
  const db: Firestore = getFirestore();

  // Build base query untuk count
  let baseQuery: Query = db.collection(collection);
  if (options.where) {
    for (const [field, op, value] of options.where) {
      baseQuery = baseQuery.where(field, op, value);
    }
  }

  // Count total
  const countSnap = await baseQuery.count().get();
  const total = countSnap.data().count;

  // Build data query
  let dataQuery: Query = baseQuery;
  if (options.orderBy) {
    for (const [field, direction] of options.orderBy) {
      dataQuery = dataQuery.orderBy(field, direction ?? "asc");
    }
  }

  const offset = (options.page - 1) * options.limit;
  dataQuery = dataQuery.limit(options.limit).offset(offset);

  const snap = await dataQuery.get();
  const items = snap.docs.map((doc) => docToObject<T>(doc.id, doc.data()));

  return { items, total, page: options.page, limit: options.limit };
}

// ---------------------------------------------------------------------------
// CREATE — Auto ID
// ---------------------------------------------------------------------------

/**
 * Membuat dokumen baru dengan auto-generated ID.
 * Otomatis menambahkan createdAt dan updatedAt.
 */
export async function createDocument<T extends object>(
  collection: string,
  data: T
): Promise<FirestoreDocument<T & TimestampFields>> {
  const db: Firestore = getFirestore();
  const docRef: DocumentReference = db.collection(collection).doc();

  const docData = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(docData);

  // Fetch the created document to get server timestamps
  const snap = await docRef.get();
  return docToObject<T & TimestampFields>(snap.id, snap.data()!);
}

/**
 * Membuat dokumen dengan custom ID.
 */
export async function createDocumentWithId<T extends object>(
  collection: string,
  id: string,
  data: T
): Promise<FirestoreDocument<T & TimestampFields>> {
  const db: Firestore = getFirestore();
  const docRef: DocumentReference = db.collection(collection).doc(id);

  const docData = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(docData);

  const snap = await docRef.get();
  return docToObject<T & TimestampFields>(snap.id, snap.data()!);
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

/**
 * Mengupdate dokumen yang sudah ada (merge partial update).
 * Otomatis mengupdate updatedAt.
 */
export async function updateDocument<T extends object>(
  collection: string,
  id: string,
  data: Partial<T>
): Promise<FirestoreDocument<T & TimestampFields> | null> {
  const db: Firestore = getFirestore();
  const docRef = db.collection(collection).doc(id);

  // Cek dokumen ada
  const existing = await docRef.get();
  if (!existing.exists) return null;

  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snap = await docRef.get();
  return docToObject<T & TimestampFields>(snap.id, snap.data()!);
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

/**
 * Menghapus dokumen berdasarkan ID.
 * Mengembalikan true jika berhasil, false jika dokumen tidak ditemukan.
 */
export async function deleteDocument(
  collection: string,
  id: string
): Promise<boolean> {
  const db: Firestore = getFirestore();
  const docRef = db.collection(collection).doc(id);

  const existing = await docRef.get();
  if (!existing.exists) return false;

  await docRef.delete();
  return true;
}

// ---------------------------------------------------------------------------
// BATCH — Multiple Operations
// ---------------------------------------------------------------------------

/**
 * Membuat banyak dokumen sekaligus dalam satu batch write.
 */
export async function batchCreateDocuments<T extends object>(
  collection: string,
  dataArray: T[]
): Promise<string[]> {
  const db: Firestore = getFirestore();
  const batch = db.batch();
  const ids: string[] = [];

  for (const data of dataArray) {
    const docRef = db.collection(collection).doc();
    ids.push(docRef.id);
    batch.set(docRef, {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return ids;
}

/**
 * Mengupdate banyak dokumen sekaligus dalam satu batch write.
 */
export async function batchUpdateDocuments<T extends object>(
  collection: string,
  dataArray: (Partial<T> & WithId)[]
): Promise<void> {
  const db: Firestore = getFirestore();
  const batch = db.batch();

  for (const data of dataArray) {
    const docRef = db.collection(collection).doc(data.id);
    const updateData = { ...data };
    delete (updateData as any).id;
    
    batch.update(docRef, {
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

// ---------------------------------------------------------------------------
// TRANSACTION Helper
// ---------------------------------------------------------------------------

/**
 * Menjalankan Firestore transaction.
 * Gunakan ini untuk operasi yang membutuhkan atomicity (misal: double booking prevention).
 */
export async function runTransaction<T>(
  fn: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> {
  const db: Firestore = getFirestore();
  return db.runTransaction(fn);
}

/**
 * Helper untuk mendapatkan DocumentReference dalam transaction.
 */
export function getDocRef(collection: string, id: string) {
  const db: Firestore = getFirestore();
  return db.collection(collection).doc(id);
}

/**
 * Helper untuk mendapatkan CollectionReference.
 */
export function getCollectionRef(collection: string) {
  const db: Firestore = getFirestore();
  return db.collection(collection);
}

// ---------------------------------------------------------------------------
// QUERY — by field value
// ---------------------------------------------------------------------------

/**
 * Mencari dokumen berdasarkan satu field.
 */
export async function findByField<T>(
  collection: string,
  field: string,
  value: unknown
): Promise<FirestoreDocument<T>[]> {
  return getCollection<T>(collection, {
    where: [[field, "==", value]],
  });
}

/**
 * Mencari satu dokumen berdasarkan field.
 */
export async function findOneByField<T>(
  collection: string,
  field: string,
  value: unknown
): Promise<FirestoreDocument<T> | null> {
  const results = await getCollection<T>(collection, {
    where: [[field, "==", value]],
    limit: 1,
  });
  return results[0] ?? null;
}

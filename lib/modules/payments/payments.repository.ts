import { COLLECTIONS } from '@/lib/firebase/firestore';
import {
  getDocument,
  getCollection,
  createDocument,
  updateDocument,
} from '@/lib/firebase/firestore-helpers';
import { Timestamp } from 'firebase-admin/firestore';
import type { Payment, PaymentStatus } from './payments.types';

function mapToPayment(id: string, data: any): Payment {
  return {
    id,
    reservationId: data.reservationId,
    userId: data.userId,
    amount: data.amount,
    currency: data.currency,
    method: data.method,
    status: data.status,
    provider: data.provider,
    transactionId: data.transactionId,
    idempotencyKey: data.idempotencyKey,
    paidAt: data.paidAt instanceof Timestamp ? data.paidAt.toDate().toISOString() : data.paidAt,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : data.expiresAt,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  }
}

export class PaymentsRepository {
  private collection = COLLECTIONS.PAYMENTS;

  async findById(id: string): Promise<Payment | null> {
    const doc = await getDocument<any>(this.collection, id);
    if (!doc) return null;
    return mapToPayment(doc.id, doc);
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    const results = await getCollection<any>(this.collection, {
      where: [["reservationId", "==", reservationId]],
      orderBy: [["createdAt", "desc"]],
      limit: 1,
    });
    return results[0] ? mapToPayment(results[0].id, results[0]) : null;
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const results = await getCollection<any>(this.collection, {
      where: [["idempotencyKey", "==", key]],
      limit: 1,
    });
    return results[0] ? mapToPayment(results[0].id, results[0]) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const results = await getCollection<any>(this.collection, {
      where: [["transactionId", "==", transactionId]],
      limit: 1,
    });
    return results[0] ? mapToPayment(results[0].id, results[0]) : null;
  }

  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const docData: any = { ...data };
    if (data.expiresAt) docData.expiresAt = Timestamp.fromDate(new Date(data.expiresAt));
    if (data.paidAt) docData.paidAt = Timestamp.fromDate(new Date(data.paidAt));

    const doc = await createDocument<any>(this.collection, docData);
    return mapToPayment(doc.id, doc);
  }

  async updateStatus(id: string, status: PaymentStatus, paidAt?: string, transactionId?: string): Promise<Payment | null> {
    const updateData: any = { status };
    if (paidAt) updateData.paidAt = Timestamp.fromDate(new Date(paidAt));
    if (transactionId) updateData.transactionId = transactionId;
    
    const updated = await updateDocument<any>(this.collection, id, updateData);
    if (!updated) return null;
    return mapToPayment(updated.id, updated);
  }
}

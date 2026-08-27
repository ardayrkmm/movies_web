import { COLLECTIONS } from "@/lib/firebase/firestore";
import {
  getDocument,
  createDocument,
  updateDocument,
  getPaginatedCollection,
  batchUpdateDocuments,
  type PaginatedResult,
} from "@/lib/firebase/firestore-helpers";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import type { Notification, CreateNotificationInput, NotificationFilters } from "./notifications.types";

function mapToNotification(id: string, data: any): Notification {
  return {
    id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data,
    isRead: !!data.isRead,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    readAt: data.readAt instanceof Timestamp ? data.readAt.toDate().toISOString() : data.readAt,
  };
}

export class NotificationsRepository {
  private collection = COLLECTIONS.NOTIFICATIONS;

  async findById(id: string): Promise<Notification | null> {
    const doc = await getDocument<any>(this.collection, id);
    if (!doc) return null;
    return mapToNotification(doc.id, doc);
  }

  async findByUserId(userId: string, filters: NotificationFilters, page: number, limit: number): Promise<PaginatedResult<Notification>> {
    const where: any[] = [["userId", "==", userId]];
    
    if (filters.isRead !== undefined) {
        where.push(["isRead", "==", filters.isRead]);
    }

    const result = await getPaginatedCollection<any>(this.collection, {
      where,
      orderBy: [["createdAt", "desc"]],
      page,
      limit,
    });
    
    return {
      ...result,
      items: result.items.map(item => mapToNotification(item.id, item))
    };
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const docData: any = {
      ...input,
      isRead: false,
    };

    const doc = await createDocument<any>(this.collection, docData);
    return mapToNotification(doc.id, doc);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const updated = await updateDocument<any>(this.collection, id, {
        isRead: true,
        readAt: Timestamp.now(),
    });
    if (!updated) return null;
    return mapToNotification(updated.id, updated);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const db = getFirestore();
    const snap = await db.collection(this.collection)
      .where("userId", "==", userId)
      .where("isRead", "==", false)
      .get();
      
    if (snap.empty) return 0;
    
    const updates = snap.docs.map(doc => ({
        id: doc.id,
        isRead: true,
        readAt: Timestamp.now(),
    }));
    
    // Batch update supports max 500, we should chunk if needed but handled inside helper if robust enough.
    // The batchUpdateDocuments helper we have just expects {id, ...data}.
    await batchUpdateDocuments(this.collection, updates);
    
    return updates.length;
  }
}

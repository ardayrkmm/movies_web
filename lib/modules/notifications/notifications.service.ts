import { NotificationsRepository } from "./notifications.repository";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";
import type { Notification, CreateNotificationInput, NotificationFilters } from "./notifications.types";
import type { PaginatedResult } from "@/lib/firebase/firestore-helpers";

// Abstraction for future notification channels (FCM, Email, WhatsApp)
export interface INotificationProvider {
    send(input: CreateNotificationInput): Promise<boolean>;
}

export class FirebaseCloudMessagingProvider implements INotificationProvider {
    async send(input: CreateNotificationInput): Promise<boolean> {
        console.log(`[FCM] Sending push notification to ${input.userId}: ${input.title}`);
        // Implementation for FCM admin.messaging().send() goes here
        return true;
    }
}

export class EmailNotificationProvider implements INotificationProvider {
    async send(input: CreateNotificationInput): Promise<boolean> {
        console.log(`[Email] Sending email to ${input.userId}: ${input.title}`);
        // Implementation for SendGrid/NodeMailer goes here
        return true;
    }
}

export class NotificationsService {
  private repo = new NotificationsRepository();
  private providers: INotificationProvider[] = [];

  constructor() {
      // Register providers. For Phase 15, we just mock them.
      this.providers.push(new FirebaseCloudMessagingProvider());
  }

  async sendNotification(input: CreateNotificationInput): Promise<Notification> {
    // 1. Persist to DB
    const notification = await this.repo.create(input);
    
    // 2. Dispatch to external providers (fire and forget, or await)
    // We don't fail the persistence if push fails.
    Promise.allSettled(this.providers.map(p => p.send(input))).catch(err => {
        console.error("Failed to send external notifications:", err);
    });

    return notification;
  }

  async getUserNotifications(userId: string, filters: NotificationFilters, page: number, limit: number): Promise<PaginatedResult<Notification>> {
    return this.repo.findByUserId(userId, filters, page, limit);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findById(id);
    if (!notification) throw new NotFoundError("Notification not found");
    if (notification.userId !== userId) throw new ForbiddenError("Not authorized to read this notification");
    
    if (notification.isRead) return notification; // Idempotent

    const updated = await this.repo.markAsRead(id);
    return updated!;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.repo.markAllAsRead(userId);
    return { count };
  }
}

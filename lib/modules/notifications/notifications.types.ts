export type NotificationType = 
  | "BOOKING_CREATED" 
  | "PAYMENT_SUCCESS" 
  | "BOOKING_CANCELLED" 
  | "BOOKING_EXPIRING" 
  | "MOVIE_REMINDER" 
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationFilters {
  isRead?: boolean;
}

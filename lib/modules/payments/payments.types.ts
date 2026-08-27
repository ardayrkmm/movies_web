/**
 * Payments — Domain Types
 */

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

export type PaymentMethod =
  | "QRIS"
  | "BANK_TRANSFER"
  | "E_WALLET"
  | "CREDIT_CARD";

export interface Payment {
  id: string;
  reservationId: string;
  userId: string;
  amount: number;
  currency: string; // e.g., "IDR"
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;       // e.g., "mock", "midtrans", "xendit"
  transactionId?: string; // provider's transaction ID
  paidAt?: string;        // ISO datetime
  expiresAt?: string;     // ISO datetime
  idempotencyKey: string; // prevent duplicate payment processing
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  reservationId: string;
  method: PaymentMethod;
}

/** Result dari payment provider */
export interface PaymentProviderResult {
  transactionId: string;
  status: PaymentStatus;
  paymentUrl?: string;   // redirect URL for web payments
  qrCode?: string;       // QRIS QR code string
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

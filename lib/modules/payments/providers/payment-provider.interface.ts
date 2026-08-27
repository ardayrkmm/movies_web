import type { PaymentProviderResult } from '@/lib/modules/payments/payments.types';
import type { PaymentStatus } from '@/lib/modules/payments/payments.types';

export interface PaymentProviderOptions {
  reservationId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  idempotencyKey: string;
}

export interface IPaymentProvider {
  readonly name: string;
  initiatePayment(options: PaymentProviderOptions): Promise<PaymentProviderResult>;
  checkStatus(transactionId: string): Promise<{ status: PaymentStatus; paidAt?: string }>;
  refund(transactionId: string, amount: number): Promise<{ success: boolean }>;
}

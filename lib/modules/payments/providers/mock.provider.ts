import type { IPaymentProvider, PaymentProviderOptions } from './payment-provider.interface';
import type { PaymentProviderResult, PaymentStatus } from '../payments.types';

export class MockPaymentProvider implements IPaymentProvider {
  readonly name = 'mock';
  
  async initiatePayment(options: PaymentProviderOptions): Promise<PaymentProviderResult> {
    const transactionId = `mock_${options.idempotencyKey}_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);
    
    return {
      transactionId,
      status: 'PENDING',
      paymentUrl: `https://mock-payment.example.com/pay/${transactionId}`,
      expiresAt: expiresAt.toISOString(),
      metadata: {
        provider: 'mock',
        note: 'This is a mock payment for development/testing only'
      }
    };
  }
  
  async checkStatus(transactionId: string): Promise<{ status: PaymentStatus; paidAt?: string }> {
    return { status: 'PENDING' };
  }
  
  async refund(transactionId: string, amount: number): Promise<{ success: boolean }> {
    console.log(`[Mock] Refund ${amount} for transaction ${transactionId}`);
    return { success: true };
  }
}

import { z } from 'zod';
export const paymentMethodSchema = z.enum(['QRIS', 'BANK_TRANSFER', 'E_WALLET', 'CREDIT_CARD']);
export const createPaymentSchema = z.object({
  method: paymentMethodSchema,
});
export const paymentWebhookSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['PAID', 'FAILED', 'EXPIRED']),
  paidAt: z.string().datetime().optional(),
  metadata: z.any().optional(),
});
export type CreatePaymentInputSchema = z.infer<typeof createPaymentSchema>;
export type PaymentWebhookInputSchema = z.infer<typeof paymentWebhookSchema>;

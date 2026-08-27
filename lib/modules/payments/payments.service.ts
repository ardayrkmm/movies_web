import { PaymentsRepository } from "./payments.repository";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from "@/lib/api/errors";
import type { Payment, CreatePaymentInput } from "./payments.types";
import { MockPaymentProvider } from "./providers/mock.provider";

const provider = new MockPaymentProvider();

export class PaymentsService {
  private repo = new PaymentsRepository();
  private reservationsRepo = new ReservationsRepository();

  async initiatePayment(reservationId: string, userId: string, input: CreatePaymentInput): Promise<Payment & { paymentUrl?: string }> {
    const reservation = await this.reservationsRepo.findById(reservationId);
    if (!reservation) throw new NotFoundError("Reservation not found");
    if (reservation.userId !== userId) throw new ForbiddenError("Not authorized to pay for this reservation");
    if (reservation.status !== 'PENDING') throw new BadRequestError(`Cannot initiate payment for reservation in ${reservation.status} status`);
    
    // Check if there's already an active payment
    const existingActive = await this.repo.findByReservationId(reservationId);
    if (existingActive && ['PENDING', 'PAID'].includes(existingActive.status)) {
        throw new ConflictError("There is already an active payment for this reservation");
    }

    const idempotencyKey = `${reservationId}_${input.method}_${userId}`;
    const existingByIdempotency = await this.repo.findByIdempotencyKey(idempotencyKey);
    if (existingByIdempotency) {
        return existingByIdempotency;
    }

    const result = await provider.initiatePayment({
        reservationId,
        userId,
        amount: reservation.total,
        currency: "IDR",
        method: input.method,
        idempotencyKey,
    });

    const payment = await this.repo.create({
        reservationId,
        userId,
        amount: reservation.total,
        currency: "IDR",
        method: input.method,
        status: result.status,
        provider: provider.name,
        transactionId: result.transactionId,
        idempotencyKey,
        expiresAt: result.expiresAt,
    });

    return {
        ...payment,
        paymentUrl: result.paymentUrl,
    };
  }

  async getPaymentById(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new NotFoundError("Payment not found");
    if (payment.userId !== userId && userRole !== "ADMIN") {
        throw new ForbiddenError("Not authorized to view this payment");
    }
    return payment;
  }

  async cancelPayment(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.getPaymentById(id, userId, userRole);
    if (payment.status !== 'PENDING') {
        throw new BadRequestError(`Cannot cancel payment in ${payment.status} status`);
    }
    
    const updated = await this.repo.updateStatus(id, 'EXPIRED');
    return updated!;
  }

  async handleWebhook(transactionId: string, status: 'PAID' | 'FAILED' | 'EXPIRED', paidAt?: string): Promise<void> {
    const payment = await this.repo.findByTransactionId(transactionId);
    if (!payment) {
        console.warn(`[Webhook] Payment with transactionId ${transactionId} not found`);
        return;
    }
    
    if (['PAID', 'FAILED', 'EXPIRED', 'REFUNDED'].includes(payment.status)) {
        console.log(`[Webhook] Payment ${payment.id} already in final status: ${payment.status}`);
        return;
    }
    
    await this.repo.updateStatus(payment.id, status, paidAt);
    
    // Update reservation status
    if (status === 'PAID') {
        await this.reservationsRepo.updateStatus(payment.reservationId, 'PAID');
    } else if (status === 'EXPIRED') {
        await this.reservationsRepo.updateStatus(payment.reservationId, 'EXPIRED');
    }
    // If FAILED, we keep reservation as PENDING so they can retry.
  }
}

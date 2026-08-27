import { PaymentsService } from "@/lib/modules/payments/payments.service";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { PaymentsRepository } from "@/lib/modules/payments/payments.repository";
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from "@/lib/api/errors";
import { getFirestore } from "firebase-admin/firestore";

jest.mock("@/lib/modules/reservations/reservations.repository");
jest.mock("@/lib/modules/payments/payments.repository");
jest.mock("firebase-admin/firestore", () => {
    return {
      getFirestore: jest.fn(),
      FieldValue: {
          serverTimestamp: jest.fn(),
      }
    };
});

describe("PaymentsService", () => {
  let service: PaymentsService;
  let mockRunTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService();
    
    mockRunTransaction = jest.fn();
    (getFirestore as jest.Mock).mockReturnValue({
        runTransaction: mockRunTransaction,
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
    });
  });

  describe("initiatePayment", () => {
    const input = {
      reservationId: "res-1",
      method: "QRIS" as const,
      idempotencyKey: "key-123"
    };
    const userId = "user-1";

    it("should throw NotFoundError if reservation not found", async () => {
      (ReservationsRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.initiatePayment("res-1", userId, input)).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if reservation belongs to someone else", async () => {
      (ReservationsRepository.prototype.findById as jest.Mock).mockResolvedValue({ userId: "user-2" });
      await expect(service.initiatePayment("res-1", userId, input)).rejects.toThrow(ForbiddenError);
    });

    it("should throw BadRequestError if reservation is not PENDING", async () => {
      (ReservationsRepository.prototype.findById as jest.Mock).mockResolvedValue({ userId: "user-1", status: "PAID" });
      await expect(service.initiatePayment("res-1", userId, input)).rejects.toThrow(BadRequestError);
      await expect(service.initiatePayment("res-1", userId, input)).rejects.toThrow("Cannot initiate payment for reservation in PAID status");
    });

    it("should return existing payment if idempotencyKey matches", async () => {
      (ReservationsRepository.prototype.findById as jest.Mock).mockResolvedValue({ userId: "user-1", status: "PENDING" });
      (PaymentsRepository.prototype.findByIdempotencyKey as jest.Mock).mockResolvedValue({ id: "pay-1", status: "PENDING" });
      
      const result = await service.initiatePayment("res-1", userId, input);
      expect(result.id).toBe("pay-1");
      expect(PaymentsRepository.prototype.create).not.toHaveBeenCalled();
    });

    it("should create new payment and trigger provider if valid", async () => {
      (ReservationsRepository.prototype.findById as jest.Mock).mockResolvedValue({ userId: "user-1", status: "PENDING", total: 100000 });
      (PaymentsRepository.prototype.findByIdempotencyKey as jest.Mock).mockResolvedValue(null);
      
      const mockCreatedPayment = { id: "pay-new", status: "PENDING", transactionId: "txn-123" };
      (PaymentsRepository.prototype.create as jest.Mock).mockResolvedValue(mockCreatedPayment);
      (PaymentsRepository.prototype.updateStatus as jest.Mock).mockResolvedValue({ ...mockCreatedPayment, transactionId: "mock-txn-id" });

      const result = await service.initiatePayment("res-1", userId, input);
      expect(result.id).toBe("pay-new");
      expect(PaymentsRepository.prototype.create).toHaveBeenCalled();
    });
  });
});

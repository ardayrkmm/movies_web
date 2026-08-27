import { ReservationsService } from "@/lib/modules/reservations/reservations.service";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { ShowtimesRepository } from "@/lib/modules/showtimes/showtimes.repository";
import { SeatsRepository } from "@/lib/modules/seats/seats.repository";
import { NotFoundError, BadRequestError, ConflictError } from "@/lib/api/errors";
import { getFirestore } from "firebase-admin/firestore";

// Mock dependencies
jest.mock("@/lib/modules/reservations/reservations.repository");
jest.mock("@/lib/modules/showtimes/showtimes.repository");
jest.mock("@/lib/modules/seats/seats.repository");
jest.mock("firebase-admin/firestore", () => {
  return {
    getFirestore: jest.fn(),
    FieldValue: {
        serverTimestamp: jest.fn(),
    }
  };
});

describe("ReservationsService - Business Logic", () => {
  let service: ReservationsService;
  let mockRunTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservationsService();
    
    mockRunTransaction = jest.fn();
    (getFirestore as jest.Mock).mockReturnValue({
        runTransaction: mockRunTransaction,
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
    });
  });

  describe("createReservation", () => {
    const input = {
      showtimeId: "show-1",
      seatIds: ["seat-1", "seat-2"]
    };
    const userId = "user-1";

    it("should throw NotFoundError if showtime does not exist", async () => {
      (ShowtimesRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.createReservation(userId, input)).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if showtime is cancelled", async () => {
      (ShowtimesRepository.prototype.findById as jest.Mock).mockResolvedValue({ status: "CANCELLED" });

      await expect(service.createReservation(userId, input)).rejects.toThrow(BadRequestError);
      await expect(service.createReservation(userId, input)).rejects.toThrow("Showtime is cancelled");
    });

    it("should throw NotFoundError if some seats don't exist", async () => {
      (ShowtimesRepository.prototype.findById as jest.Mock).mockResolvedValue({ status: "SCHEDULED", studioId: "studio-1", basePrice: 50000 });
      (SeatsRepository.prototype.findManyByIds as jest.Mock).mockResolvedValue([{ id: "seat-1", studioId: "studio-1", status: "AVAILABLE", priceModifier: 0 }]); // Only 1 seat returned

      await expect(service.createReservation(userId, input)).rejects.toThrow(NotFoundError);
      await expect(service.createReservation(userId, input)).rejects.toThrow("One or more seats not found");
    });

    it("should throw BadRequestError if seat belongs to wrong studio", async () => {
      (ShowtimesRepository.prototype.findById as jest.Mock).mockResolvedValue({ status: "SCHEDULED", studioId: "studio-1", basePrice: 50000 });
      (SeatsRepository.prototype.findManyByIds as jest.Mock).mockResolvedValue([
        { id: "seat-1", studioId: "studio-1", status: "AVAILABLE", priceModifier: 0 },
        { id: "seat-2", studioId: "studio-2", status: "AVAILABLE", priceModifier: 0 } // Wrong studio
      ]);

      await expect(service.createReservation(userId, input)).rejects.toThrow(BadRequestError);
    });

    it("should delegate creation to Firestore transaction to prevent double booking", async () => {
      (ShowtimesRepository.prototype.findById as jest.Mock).mockResolvedValue({ status: "SCHEDULED", studioId: "studio-1", basePrice: 50000 });
      (SeatsRepository.prototype.findManyByIds as jest.Mock).mockResolvedValue([
        { id: "seat-1", studioId: "studio-1", status: "AVAILABLE", priceModifier: 0 },
        { id: "seat-2", studioId: "studio-1", status: "AVAILABLE", priceModifier: 10000 }
      ]);
      
      mockRunTransaction.mockResolvedValue({ id: "res-1", total: 110000 });

      const result = await service.createReservation(userId, input);
      
      expect(mockRunTransaction).toHaveBeenCalled();
      expect(result.id).toBe("res-1");
      expect(result.total).toBe(110000);
    });
  });
});

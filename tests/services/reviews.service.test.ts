import { ReviewsService } from "@/lib/modules/reviews/reviews.service";
import { ReviewsRepository } from "@/lib/modules/reviews/reviews.repository";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { MoviesRepository } from "@/lib/modules/movies/movies.repository";
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from "@/lib/api/errors";
import { getFirestore } from "firebase-admin/firestore";

jest.mock("@/lib/modules/reviews/reviews.repository");
jest.mock("@/lib/modules/reservations/reservations.repository");
jest.mock("@/lib/modules/movies/movies.repository");
jest.mock("firebase-admin/firestore", () => {
    return {
      getFirestore: jest.fn(),
      FieldValue: {
          serverTimestamp: jest.fn(),
      }
    };
});

describe("ReviewsService", () => {
  let service: ReviewsService;
  let mockRunTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReviewsService();
    
    mockRunTransaction = jest.fn();
    (getFirestore as jest.Mock).mockReturnValue({
        runTransaction: mockRunTransaction,
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
    });
  });

  describe("createReview", () => {
    const input = {
      movieId: "movie-1",
      reservationId: "res-1",
      rating: 5,
      comment: "Great movie!"
    };
    const userId = "user-1";

    it("should throw NotFoundError if movie does not exist", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.createReview(userId, input)).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if reservation belongs to someone else", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (ReservationsRepository.prototype.findWithItems as jest.Mock).mockResolvedValue({ userId: "user-2" });
      await expect(service.createReview(userId, input)).rejects.toThrow(ForbiddenError);
    });

    it("should throw BadRequestError if reservation is not PAID/CONFIRMED", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (ReservationsRepository.prototype.findWithItems as jest.Mock).mockResolvedValue({ userId: "user-1", status: "PENDING" });
      await expect(service.createReview(userId, input)).rejects.toThrow(BadRequestError);
      await expect(service.createReview(userId, input)).rejects.toThrow("Only completed reservations can be used for reviews");
    });

    it("should throw ConflictError if review already exists", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (ReservationsRepository.prototype.findWithItems as jest.Mock).mockResolvedValue({ userId: "user-1", status: "CONFIRMED" });
      (ReviewsRepository.prototype.findByUserAndMovie as jest.Mock).mockResolvedValue({ id: "rev-1" });
      
      await expect(service.createReview(userId, input)).rejects.toThrow(ConflictError);
    });

    it("should delegate to transaction if all valid", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (ReservationsRepository.prototype.findWithItems as jest.Mock).mockResolvedValue({ userId: "user-1", status: "PAID" });
      (ReviewsRepository.prototype.findByUserAndMovie as jest.Mock).mockResolvedValue(null);
      
      mockRunTransaction.mockResolvedValue({ id: "rev-new" });

      const result = await service.createReview(userId, input);
      expect(result.id).toBe("rev-new");
      expect(mockRunTransaction).toHaveBeenCalled();
    });
  });
});

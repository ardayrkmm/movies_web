import { ShowtimesService } from "@/lib/modules/showtimes/showtimes.service";
import { MoviesRepository } from "@/lib/modules/movies/movies.repository";
import { CinemasRepository } from "@/lib/modules/cinemas/cinemas.repository";
import { StudiosRepository } from "@/lib/modules/studios/studios.repository";
import { ShowtimesRepository } from "@/lib/modules/showtimes/showtimes.repository";
import { NotFoundError, BadRequestError, ConflictError } from "@/lib/api/errors";

jest.mock("@/lib/modules/movies/movies.repository");
jest.mock("@/lib/modules/cinemas/cinemas.repository");
jest.mock("@/lib/modules/studios/studios.repository");
jest.mock("@/lib/modules/showtimes/showtimes.repository");

describe("ShowtimesService", () => {
  let service: ShowtimesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ShowtimesService();
  });

  describe("createShowtime", () => {
    const input = {
      movieId: "movie-1",
      cinemaId: "cinema-1",
      studioId: "studio-1",
      startAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      basePrice: 50000
    };

    it("should throw NotFoundError if movie does not exist", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.createShowtime(input)).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if studio does not belong to cinema", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({ duration: 120 });
      (CinemasRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (StudiosRepository.prototype.findById as jest.Mock).mockResolvedValue({ cinemaId: "cinema-2" }); // Mismatch

      await expect(service.createShowtime(input)).rejects.toThrow(BadRequestError);
      await expect(service.createShowtime(input)).rejects.toThrow("Studio does not belong to the specified cinema");
    });

    it("should throw ConflictError if schedule overlaps", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({ duration: 120 });
      (CinemasRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (StudiosRepository.prototype.findById as jest.Mock).mockResolvedValue({ cinemaId: "cinema-1" });
      
      // Mock existing overlapping showtime
      (ShowtimesRepository.prototype.findOverlapping as jest.Mock).mockResolvedValue([{ id: "show-x" }]);

      await expect(service.createShowtime(input)).rejects.toThrow(ConflictError);
      await expect(service.createShowtime(input)).rejects.toThrow("Studio already has a showtime in this time slot");
    });

    it("should create showtime with calculated endAt if no overlap", async () => {
      (MoviesRepository.prototype.findById as jest.Mock).mockResolvedValue({ duration: 120 });
      (CinemasRepository.prototype.findById as jest.Mock).mockResolvedValue({});
      (StudiosRepository.prototype.findById as jest.Mock).mockResolvedValue({ cinemaId: "cinema-1" });
      
      (ShowtimesRepository.prototype.findOverlapping as jest.Mock).mockResolvedValue([]);
      (ShowtimesRepository.prototype.create as jest.Mock).mockResolvedValue({ id: "show-new" });

      const result = await service.createShowtime(input);
      expect(result.id).toBe("show-new");
      expect(ShowtimesRepository.prototype.create).toHaveBeenCalled();
    });
  });
});

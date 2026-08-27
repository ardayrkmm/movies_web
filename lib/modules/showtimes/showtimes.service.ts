import { ShowtimesRepository } from "./showtimes.repository";
import { MoviesRepository } from "@/lib/modules/movies/movies.repository";
import { CinemasRepository } from "@/lib/modules/cinemas/cinemas.repository";
import { StudiosRepository } from "@/lib/modules/studios/studios.repository";
import { NotFoundError, ConflictError, BadRequestError } from "@/lib/api/errors";
import type { Showtime, CreateShowtimeInput, UpdateShowtimeInput, ShowtimeFilters } from "./showtimes.types";
import type { PaginatedResult } from "@/lib/firebase/firestore-helpers";

export class ShowtimesService {
  private repo: ShowtimesRepository;
  private moviesRepo: MoviesRepository;
  private cinemasRepo: CinemasRepository;
  private studiosRepo: StudiosRepository;

  constructor() {
    this.repo = new ShowtimesRepository();
    this.moviesRepo = new MoviesRepository();
    this.cinemasRepo = new CinemasRepository();
    this.studiosRepo = new StudiosRepository();
  }

  async listShowtimes(filters: ShowtimeFilters, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    return this.repo.findMany(filters, page, limit);
  }

  async getShowtimeById(id: string): Promise<Showtime> {
    const showtime = await this.repo.findById(id);
    if (!showtime) {
      throw new NotFoundError("Showtime not found");
    }
    return showtime;
  }

  async getShowtimesByMovie(movieId: string, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    return this.repo.findByMovieId(movieId, page, limit);
  }

  async getShowtimesByCinema(cinemaId: string, page: number, limit: number): Promise<PaginatedResult<Showtime>> {
    return this.repo.findByCinemaId(cinemaId, page, limit);
  }

  async createShowtime(input: CreateShowtimeInput): Promise<Showtime> {
    // 1. Validations
    const movie = await this.moviesRepo.findById(input.movieId);
    if (!movie) throw new NotFoundError("Movie not found");

    const cinema = await this.cinemasRepo.findById(input.cinemaId);
    if (!cinema) throw new NotFoundError("Cinema not found");

    const studio = await this.studiosRepo.findById(input.studioId);
    if (!studio) throw new NotFoundError("Studio not found");

    if (studio.cinemaId !== input.cinemaId) {
      throw new BadRequestError("Studio does not belong to the specified cinema");
    }

    // 2. Compute endAt
    const startAtDate = new Date(input.startAt);
    const endAtDate = new Date(startAtDate.getTime() + movie.duration * 60 * 1000);

    // 3. Overlap check
    const overlapping = await this.repo.findOverlapping(input.studioId, startAtDate, endAtDate);
    if (overlapping.length > 0) {
      throw new ConflictError("Studio already has a showtime in this time slot");
    }

    // 4. Create
    return this.repo.create({
      ...input,
      endAt: endAtDate.toISOString(),
      status: "SCHEDULED",
    });
  }

  async updateShowtime(id: string, input: UpdateShowtimeInput): Promise<Showtime> {
    const showtime = await this.getShowtimeById(id);

    let startAtDate = new Date(showtime.startAt);
    let endAtDate = new Date(showtime.endAt);
    let newEndAtIso = undefined;

    if (input.startAt && input.startAt !== showtime.startAt) {
        startAtDate = new Date(input.startAt);
        const movie = await this.moviesRepo.findById(showtime.movieId);
        if (movie) {
            endAtDate = new Date(startAtDate.getTime() + movie.duration * 60 * 1000);
            newEndAtIso = endAtDate.toISOString();
        }

        const overlapping = await this.repo.findOverlapping(showtime.studioId, startAtDate, endAtDate, id);
        if (overlapping.length > 0) {
            throw new ConflictError("Studio already has a showtime in this new time slot");
        }
    }

    const updated = await this.repo.update(id, {
        ...input,
        ...(newEndAtIso ? { endAt: newEndAtIso as any } : {}) // Note: endAt is not in UpdateShowtimeInput natively, handle carefully
    });

    if (!updated) throw new NotFoundError("Showtime not found");
    return updated;
  }

  async deleteShowtime(id: string): Promise<void> {
    await this.getShowtimeById(id);
    const hasReservations = await this.repo.hasActiveReservations(id);
    if (hasReservations) {
        throw new ConflictError("Cannot delete showtime with active reservations. Cancel it instead.");
    }
    await this.repo.delete(id);
  }
}

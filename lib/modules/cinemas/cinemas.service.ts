import { CinemasRepository } from "./cinemas.repository";
import { StudiosRepository } from "@/lib/modules/studios/studios.repository";
import { NotFoundError, ConflictError } from "@/lib/api/errors";
import type { Cinema, CreateCinemaInput, UpdateCinemaInput, CinemaFilters } from "./cinemas.types";
import type { PaginatedResult } from "@/lib/firebase/firestore-helpers";
import type { Studio } from "@/lib/modules/studios/studios.types";

export class CinemasService {
  private repo: CinemasRepository;
  private studiosRepo: StudiosRepository;

  constructor() {
    this.repo = new CinemasRepository();
    this.studiosRepo = new StudiosRepository();
  }

  async listCinemas(filters: CinemaFilters, page: number, limit: number): Promise<PaginatedResult<Cinema>> {
    return this.repo.findAll(filters, page, limit);
  }

  async getCinemaById(id: string): Promise<Cinema> {
    const cinema = await this.repo.findById(id);
    if (!cinema) {
      throw new NotFoundError("Cinema not found");
    }
    return cinema;
  }

  async getCinemaStudios(cinemaId: string): Promise<Studio[]> {
    // Validasi cinema exist
    await this.getCinemaById(cinemaId);
    return this.studiosRepo.findByCinemaId(cinemaId);
  }

  async createCinema(input: CreateCinemaInput): Promise<Cinema> {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError("Cinema with this slug already exists");
    }
    return this.repo.create(input);
  }

  async updateCinema(id: string, input: UpdateCinemaInput): Promise<Cinema> {
    await this.getCinemaById(id);

    if (input.slug) {
      const existing = await this.repo.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError("Cinema with this slug already exists");
      }
    }

    const updated = await this.repo.update(id, input);
    if (!updated) {
      throw new NotFoundError("Cinema not found");
    }
    return updated;
  }

  async deleteCinema(id: string): Promise<void> {
    await this.getCinemaById(id);
    // TODO: Cek apakah ada studios? Idealnya jangan delete kalau masih ada studios.
    const studios = await this.studiosRepo.findByCinemaId(id);
    if (studios.length > 0) {
        throw new ConflictError("Cannot delete cinema with existing studios");
    }

    await this.repo.delete(id);
  }
}

import { StudiosRepository } from "./studios.repository";
import { CinemasRepository } from "@/lib/modules/cinemas/cinemas.repository";
import { NotFoundError, ConflictError, BadRequestError } from "@/lib/api/errors";
import type { Studio, CreateStudioInput, UpdateStudioInput } from "./studios.types";

export class StudiosService {
  private repo: StudiosRepository;
  private cinemasRepo: CinemasRepository;

  constructor() {
    this.repo = new StudiosRepository();
    this.cinemasRepo = new CinemasRepository();
  }

  async getStudioById(id: string): Promise<Studio> {
    const studio = await this.repo.findById(id);
    if (!studio) {
      throw new NotFoundError("Studio not found");
    }
    return studio;
  }

  async getStudiosByCinema(cinemaId: string): Promise<Studio[]> {
    // Validasi cinema exist
    const cinema = await this.cinemasRepo.findById(cinemaId);
    if (!cinema) {
      throw new NotFoundError("Cinema not found");
    }
    return this.repo.findByCinemaId(cinemaId);
  }

  async createStudio(input: CreateStudioInput): Promise<Studio> {
    // Validasi cinema
    const cinema = await this.cinemasRepo.findById(input.cinemaId);
    if (!cinema) {
      throw new NotFoundError("Cinema not found");
    }

    // Cek nama duplikat di cinema yang sama
    const existing = await this.repo.findByNameAndCinema(input.name, input.cinemaId);
    if (existing) {
      throw new ConflictError("Studio with this name already exists in this cinema");
    }

    return this.repo.create(input);
  }

  async updateStudio(id: string, input: UpdateStudioInput): Promise<Studio> {
    const studio = await this.getStudioById(id);

    if (input.name) {
      const existing = await this.repo.findByNameAndCinema(input.name, studio.cinemaId);
      if (existing && existing.id !== id) {
        throw new ConflictError("Studio with this name already exists in this cinema");
      }
    }

    const updated = await this.repo.update(id, input);
    if (!updated) {
      throw new NotFoundError("Studio not found");
    }
    return updated;
  }

  async deleteStudio(id: string): Promise<void> {
    await this.getStudioById(id);
    // TODO: Cek reservations/showtimes before delete (soft delete better)
    await this.repo.delete(id);
  }
}

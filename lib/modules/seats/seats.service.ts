import { SeatsRepository } from "./seats.repository";
import { StudiosRepository } from "@/lib/modules/studios/studios.repository";
import { NotFoundError, ConflictError } from "@/lib/api/errors";
import type { Seat, CreateSeatInput, UpdateSeatInput, BulkCreateSeatsInput } from "./seats.types";

export class SeatsService {
  private repo: SeatsRepository;
  private studiosRepo: StudiosRepository;

  constructor() {
    this.repo = new SeatsRepository();
    this.studiosRepo = new StudiosRepository();
  }

  async getSeatsByStudio(studioId: string): Promise<Seat[]> {
    const studio = await this.studiosRepo.findById(studioId);
    if (!studio) {
      throw new NotFoundError("Studio not found");
    }
    return this.repo.findByStudioId(studioId);
  }

  async createSeat(studioId: string, input: Omit<CreateSeatInput, 'studioId'>): Promise<Seat> {
    const studio = await this.studiosRepo.findById(studioId);
    if (!studio) {
      throw new NotFoundError("Studio not found");
    }

    const existing = await this.repo.findByLabel(studioId, input.label);
    if (existing) {
      throw new ConflictError(`Seat with label ${input.label} already exists in this studio`);
    }

    return this.repo.create({
      ...input,
      studioId,
    });
  }

  async bulkCreateSeats(studioId: string, input: BulkCreateSeatsInput): Promise<number> {
    const studio = await this.studiosRepo.findById(studioId);
    if (!studio) {
      throw new NotFoundError("Studio not found");
    }

    const existingSeats = await this.repo.findByStudioId(studioId);
    const existingLabels = new Set(existingSeats.map(s => s.label));

    const seatsToCreate: CreateSeatInput[] = [];

    for (const row of input.rows) {
      for (let number = 1; number <= input.seatsPerRow; number++) {
        const label = `${row.toUpperCase()}${number}`;
        
        // Skip if already exists
        if (existingLabels.has(label)) {
          continue;
        }

        seatsToCreate.push({
          studioId,
          row: row.toUpperCase(),
          number,
          label,
          type: input.type || "REGULAR",
          priceModifier: input.priceModifier || 1.0,
        });
      }
    }

    if (seatsToCreate.length === 0) {
      return 0;
    }

    const createdIds = await this.repo.bulkCreate(seatsToCreate);
    
    // Update studio total seats if necessary, but typically managed separately or sync'd
    // Leaving out auto-sync of totalSeats for now, admin can update studio explicitly.
    
    return createdIds.length;
  }

  async updateSeat(id: string, input: UpdateSeatInput): Promise<Seat> {
    const seat = await this.repo.findById(id);
    if (!seat) {
      throw new NotFoundError("Seat not found");
    }

    const updated = await this.repo.update(id, input);
    if (!updated) {
      throw new NotFoundError("Seat not found");
    }
    return updated;
  }

  async deleteSeat(id: string): Promise<void> {
    const seat = await this.repo.findById(id);
    if (!seat) {
      throw new NotFoundError("Seat not found");
    }
    // Soft delete
    await this.repo.delete(id);
  }
}

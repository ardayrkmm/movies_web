import { ShowtimesRepository } from "@/lib/modules/showtimes/showtimes.repository";
import { SeatsRepository } from "@/lib/modules/seats/seats.repository";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";
import { NotFoundError } from "@/lib/api/errors";
import type { SeatWithAvailability } from "@/lib/modules/seats/seats.types";

export class SeatAvailabilityService {
  private showtimesRepo = new ShowtimesRepository();
  private seatsRepo = new SeatsRepository();
  private reservationsRepo = new ReservationsRepository();

  async getSeatsForShowtime(showtimeId: string): Promise<SeatWithAvailability[]> {
    const showtime = await this.showtimesRepo.findById(showtimeId);
    if (!showtime) throw new NotFoundError("Showtime not found");

    const allSeats = await this.seatsRepo.findByStudioId(showtime.studioId);
    const availableSeats = allSeats.filter(s => s.status === 'AVAILABLE');
    
    const bookedSeatIds = await this.reservationsRepo.getBookedSeatIds(showtimeId);
    
    const mapped = availableSeats.map(seat => {
      return {
        ...seat,
        price: Math.round(showtime.basePrice * seat.priceModifier),
        availability: bookedSeatIds.has(seat.id) ? 'BOOKED' as const : 'AVAILABLE' as const,
      };
    });

    return mapped.sort((a, b) => {
      if (a.row === b.row) return a.number - b.number;
      return a.row.localeCompare(b.row);
    });
  }

  async getAvailabilitySummary(showtimeId: string) {
    const seats = await this.getSeatsForShowtime(showtimeId);
    const totalSeats = seats.length;
    const bookedSeats = seats.filter(s => s.availability === 'BOOKED').length;
    const availableSeats = totalSeats - bookedSeats;
    
    return {
      showtimeId,
      totalSeats,
      availableSeats,
      bookedSeats,
      percentage: totalSeats === 0 ? 0 : Math.round((availableSeats / totalSeats) * 100),
    };
  }
}

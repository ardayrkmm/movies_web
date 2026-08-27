import { NextResponse } from "next/server";
import { ShowtimesRepository } from "@/lib/modules/showtimes/showtimes.repository";
import { SeatsRepository } from "@/lib/modules/seats/seats.repository";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params;

    const showtimesRepo = new ShowtimesRepository();
    const showtime = await showtimesRepo.findById(id);

    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    const seatsRepo = new SeatsRepository();
    const seats = await seatsRepo.findByStudioId(showtime.studioId);

    const reservationsRepo = new ReservationsRepository();
    const bookedSeatIds = await reservationsRepo.getBookedSeatIds(id);

    const responseSeats = seats.map(seat => {
      let availability: string = seat.status;
      // Map domain "AVAILABLE" / "INACTIVE" and booked logic
      if (availability === "AVAILABLE" && bookedSeatIds.has(seat.id)) {
        availability = "BOOKED";
      }

      return {
        id: seat.id,
        label: seat.label,
        row: seat.row,
        number: seat.number,
        type: seat.type,
        status: availability,
        priceModifier: seat.priceModifier,
        price: Math.round(showtime.basePrice * seat.priceModifier)
      };
    });

    return NextResponse.json(responseSeats, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

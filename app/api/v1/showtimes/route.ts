import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { ShowtimesService } from "@/lib/modules/showtimes/showtimes.service";
import { createShowtimeSchema } from "@/lib/modules/showtimes/showtimes.schema";
import { requireRole } from "@/lib/middleware/auth";

import type { ShowtimeFilters, ShowtimeStatus } from "@/lib/modules/showtimes/showtimes.types";

export const dynamic = "force-dynamic";

const showtimesService = new ShowtimesService();

export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const movieId = url.searchParams.get("movieId") || undefined;
  const cinemaId = url.searchParams.get("cinemaId") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const city = url.searchParams.get("city") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const filters: ShowtimeFilters = {
    movieId,
    cinemaId,
    date,
    city,
    status: status as ShowtimeStatus
  };

  const showtimes = await showtimesService.listShowtimes(filters, page, limit);
  return successResponse(showtimes);
});

export const POST = withApiHandler(async (req: Request) => {
  requireRole(req, "ADMIN");
  const body = await req.json();
  const input = createShowtimeSchema.parse(body);

  const showtime = await showtimesService.createShowtime(input);
  return successResponse(showtime, "Showtime created successfully", 201);
});

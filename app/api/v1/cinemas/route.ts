import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { CinemasService } from "@/lib/modules/cinemas/cinemas.service";
import { cinemaFiltersSchema, createCinemaSchema } from "@/lib/modules/cinemas/cinemas.schema";
import { requireRole } from "@/lib/middleware/auth";

export const dynamic = "force-dynamic";

const cinemasService = new CinemasService();

export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const input = cinemaFiltersSchema.parse(params);

  const { page, limit, ...filters } = input;
  const result = await cinemasService.listCinemas(filters, page, limit);

  return successResponse(result);
});

export const POST = withApiHandler(async (req: Request) => {
  requireRole(req, "ADMIN");
  const body = await req.json();
  const input = createCinemaSchema.parse(body);

  const cinema = await cinemasService.createCinema(input);
  return successResponse(cinema, "Cinema created successfully", 201);
});

/**
 * withApiHandler — Route Handler Wrapper — Movie Reservation System
 *
 * Membungkus setiap Route Handler dengan try/catch terpusat.
 * Memetakan AppError subclass dan ZodError ke response HTTP yang tepat.
 * Error tak terduga dikembalikan sebagai 500 tanpa bocorkan detail internal.
 */

import { ZodError } from "zod";
import { AppError, ValidationError } from "@/lib/api/errors";
import { errorResponse } from "@/lib/api/response";

// Menggunakan `Request` (Web API standar) agar kompatibel dengan Route Handler
// yang menerima NextRequest (extends Request) maupun Request biasa.
// Handler boleh mengabaikan parameter (TypeScript: fewer params = assignable).
type RouteHandler = (
  request: Request,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<Response> | Response;

/**
 * Membungkus Route Handler dengan penanganan error terpusat.
 *
 * @example
 * export const GET = withApiHandler(async (req) => {
 *   // logic di sini, lempar AppError jika ada masalah
 *   return successResponse(data, "OK");
 * });
 *
 * @example — dengan dynamic route params
 * export const GET = withApiHandler(async (req, ctx) => {
 *   const { id } = await ctx!.params!;
 *   return successResponse({ id }, "OK");
 * });
 */
export function withApiHandler(handler: RouteHandler): RouteHandler {
  return async (
    request: Request,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Zod validation error — langsung dari schema.parse()
      if (error instanceof ZodError) {
        return errorResponse("Validation failed", 422, error.issues);
      }

      // ValidationError yang dibuat manual (misal dari service layer)
      if (error instanceof ValidationError) {
        return errorResponse(error.message, 422, error.issues);
      }

      // AppError subclass lainnya (NotFoundError, UnauthorizedError, dll)
      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }

      // Error tak terduga — log di server, jangan bocorkan detail ke client
      console.error("[API Error]", error);
      return errorResponse("An unexpected error occurred", 500);
    }
  };
}

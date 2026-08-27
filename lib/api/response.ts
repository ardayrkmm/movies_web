/**
 * Standard API Response Builders — Movie Reservation System
 *
 * Semua Route Handler harus menggunakan fungsi di bawah ini untuk memastikan
 * response shape yang konsisten di seluruh API.
 */

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedData,
  PaginationMeta,
} from "@/lib/types/api";
import type { ZodIssue } from "zod";

// ---------------------------------------------------------------------------
// Success Responses
// ---------------------------------------------------------------------------

/**
 * Membuat response sukses standar.
 *
 * @example
 * return successResponse({ id: "123" }, "Movie fetched", 200);
 * // → { success: true, message: "Movie fetched", data: { id: "123" } }
 */
export function successResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return Response.json(body, { status });
}

/**
 * Membuat response sukses untuk resource yang baru dibuat (HTTP 201).
 */
export function createdResponse<T>(
  data: T,
  message: string = "Resource created successfully"
): Response {
  return successResponse(data, message, 201);
}

/**
 * Membuat response sukses tanpa body (HTTP 204).
 * Digunakan untuk DELETE atau operasi yang tidak perlu mengembalikan data.
 */
export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Membuat response sukses dengan data terpaginasi.
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = "Success"
): Response {
  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  const data: PaginatedData<T> = { items, pagination };
  return successResponse(data, message, 200);
}

// ---------------------------------------------------------------------------
// Error Responses
// ---------------------------------------------------------------------------

/**
 * Membuat response error standar.
 *
 * @example
 * return errorResponse("Not found", 404);
 * // → { success: false, message: "Not found" }
 */
export function errorResponse(
  message: string,
  status: number = 500,
  errors?: ZodIssue[] | string[]
): Response {
  const body: ApiErrorResponse = {
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
  return Response.json(body, { status });
}

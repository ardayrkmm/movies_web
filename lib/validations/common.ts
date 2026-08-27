/**
 * Common Zod Validation Schemas — Movie Reservation System
 *
 * Schema yang digunakan ulang di banyak module. Import dari sini
 * untuk konsistensi validasi di seluruh API.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ---------------------------------------------------------------------------
// Dynamic Route Params
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1, "ID tidak boleh kosong").trim(),
});

export type IdParam = z.infer<typeof idParamSchema>;

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

export type SortOrder = z.infer<typeof sortOrderSchema>;

// ---------------------------------------------------------------------------
// Helper: parse query params dari NextRequest.nextUrl.searchParams
// ---------------------------------------------------------------------------

/**
 * Mengkonversi URLSearchParams ke plain object agar dapat di-parse Zod.
 *
 * @example
 * const parsed = paginationSchema.parse(searchParamsToObject(req.nextUrl.searchParams));
 */
export function searchParamsToObject(
  searchParams: URLSearchParams
): Record<string, string> {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

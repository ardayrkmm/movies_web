/**
 * API Response Types — Movie Reservation System
 *
 * Semua response dari API harus mengikuti shape yang didefinisikan di sini
 * agar konsisten antara web (Next.js) dan mobile (Flutter).
 */

import type { ZodIssue } from "zod";

// ---------------------------------------------------------------------------
// Base Response Shapes
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ZodIssue[] | string[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

export interface HealthCheckData {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  env: string;
  version: string;
  services: {
    firestore: "ok" | "error";
  };
}

/**
 * Custom Error Classes — Movie Reservation System
 *
 * Semua error yang dilempar dari handler/service harus menggunakan
 * class di bawah ini agar dapat dipetakan ke HTTP response yang tepat
 * oleh withApiHandler().
 */

import type { ZodIssue } from "zod";

// ---------------------------------------------------------------------------
// Base Error
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Memastikan instanceof bekerja setelah transpile TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// HTTP 400 — Bad Request
// ---------------------------------------------------------------------------

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

// ---------------------------------------------------------------------------
// HTTP 401 — Unauthorized
// ---------------------------------------------------------------------------

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

// ---------------------------------------------------------------------------
// HTTP 403 — Forbidden
// ---------------------------------------------------------------------------

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

// ---------------------------------------------------------------------------
// HTTP 404 — Not Found
// ---------------------------------------------------------------------------

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

// ---------------------------------------------------------------------------
// HTTP 409 — Conflict
// ---------------------------------------------------------------------------

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}

// ---------------------------------------------------------------------------
// HTTP 422 — Validation Error
// ---------------------------------------------------------------------------

export class ValidationError extends AppError {
  public readonly issues: ZodIssue[];

  constructor(issues: ZodIssue[], message: string = "Validation failed") {
    super(message, 422);
    this.issues = issues;
  }
}

// ---------------------------------------------------------------------------
// HTTP 429 — Too Many Requests
// ---------------------------------------------------------------------------

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

// ---------------------------------------------------------------------------
// HTTP 500 — Internal Server Error
// ---------------------------------------------------------------------------

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

/**
 * Auth Middleware — Movie Reservation System
 *
 * Helper untuk mengekstrak dan memverifikasi JWT dari header Authorization.
 * Digunakan oleh route handlers yang membutuhkan autentikasi.
 *
 * Usage:
 *   const user = await requireAuth(req);
 *   await requireRole(req, "ADMIN");
 */

import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/errors";

// ---------------------------------------------------------------------------
// JWT Config
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";

// ---------------------------------------------------------------------------
// Token Payload Types
// ---------------------------------------------------------------------------

export interface JwtPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

// ---------------------------------------------------------------------------
// Token Generation
// ---------------------------------------------------------------------------

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return JWT_SECRET;
}

function getRefreshSecret(): string {
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }
  return JWT_REFRESH_SECRET;
}

/**
 * Generate access token (15 menit TTL).
 */
export function generateAccessToken(payload: AuthUser): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

/**
 * Generate refresh token (7 hari TTL).
 */
export function generateRefreshToken(payload: AuthUser): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

// ---------------------------------------------------------------------------
// Token Extraction
// ---------------------------------------------------------------------------

/**
 * Ekstrak Bearer token dari header Authorization.
 */
function extractBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1] ?? null;
}

// ---------------------------------------------------------------------------
// Token Verification
// ---------------------------------------------------------------------------

/**
 * Verifikasi access token dan kembalikan payload.
 * Melempar UnauthorizedError jika token tidak valid.
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

/**
 * Verifikasi refresh token dan kembalikan payload.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getRefreshSecret()) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

// ---------------------------------------------------------------------------
// Middleware Helpers
// ---------------------------------------------------------------------------

/**
 * Memastikan request memiliki valid access token.
 * Mengembalikan AuthUser jika valid.
 * Melempar UnauthorizedError jika tidak valid.
 *
 * @example
 * export const GET = withApiHandler(async (req) => {
 *   const user = await requireAuth(req);
 *   // user.userId, user.email, user.role
 * });
 */
export function requireAuth(request: Request): AuthUser {
  const token = extractBearerToken(request);
  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  const payload = verifyAccessToken(token);
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Memastikan request memiliki valid access token DAN role yang sesuai.
 * Melempar ForbiddenError jika role tidak mencukupi.
 *
 * @example
 * const admin = requireRole(req, "ADMIN");
 */
export function requireRole(
  request: Request,
  role: "USER" | "ADMIN"
): AuthUser {
  const user = requireAuth(request);

  // ADMIN dapat mengakses semua endpoint
  if (user.role === "ADMIN") return user;

  // USER hanya dapat mengakses endpoint USER
  if (user.role !== role) {
    throw new ForbiddenError(
      `Access denied: requires ${role} role`
    );
  }

  return user;
}

/**
 * Mencoba ekstrak user dari token tanpa melempar error.
 * Berguna untuk endpoint yang optional authentication.
 */
export function optionalAuth(request: Request): AuthUser | null {
  try {
    const token = extractBearerToken(request);
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

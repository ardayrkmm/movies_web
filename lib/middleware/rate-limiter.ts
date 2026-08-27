import { TooManyRequestsError } from "@/lib/api/errors";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store. In production/serverless, use Redis (e.g. Upstash).
const limits = new Map<string, RateLimitInfo>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export function rateLimit(req: Request, options: RateLimitOptions) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
  const key = `${options.keyPrefix}:${ip}`;

  const now = Date.now();
  const info = limits.get(key);

  if (info) {
    if (now > info.resetTime) {
      // Reset window
      limits.set(key, { count: 1, resetTime: now + options.windowMs });
    } else {
      info.count++;
      if (info.count > options.maxRequests) {
        throw new TooManyRequestsError(`Rate limit exceeded for ${options.keyPrefix}`);
      }
    }
  } else {
    limits.set(key, { count: 1, resetTime: now + options.windowMs });
  }
}

// Predefined limiters
export const authLimiter = (req: Request) => rateLimit(req, { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "auth" });
export const paymentLimiter = (req: Request) => rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: "payment" });
export const reservationLimiter = (req: Request) => rateLimit(req, { windowMs: 15 * 60 * 1000, maxRequests: 20, keyPrefix: "reservation" });

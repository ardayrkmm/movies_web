# Security Audit & Hardening Report

This document outlines the security measures implemented and audited in the Movie Reservation System Backend API (Phase 16).

## 1. Authentication & Authorization
- **Authentication**: JWT verification is strictly enforced via `requireAuth(req)` in the middleware layer.
- **Authorization**: Endpoint isolation is successfully implemented. Admin routes explicitly call `requireRole(req, "ADMIN")`.
- **Secret Management**: JWT keys and Firebase Admin SDK credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) are managed strictly via Environment Variables (`.env.local`). No hardcoded credentials exist.

## 2. Resource Isolation (IDOR Prevention)
- Insecure Direct Object Reference (IDOR) vulnerabilities have been mitigated at the service level:
  - Users can only fetch/modify their own User profile (`getMe`, `updateMe`).
  - Users can only fetch their own `bookingHistory`.
  - Review modifications (`PATCH`, `DELETE`) verify `review.userId === currentUserId`.
  - Notifications routes only allow users to mark their own notifications as read.

## 3. Data Integrity & Validation
- **Zod Validation**: All incoming request bodies and query parameters are rigorously parsed and validated using strict Zod schemas before hitting business logic.
- **Untrusted Input**: Inputs are completely sanitized, and HTTP methods/Content-Types are inherently locked down by the Next.js App Router route structure (`POST`, `GET`, etc.).
- **Password Exposure**: Passwords are comprehensively hashed using `bcrypt` (12 rounds) and are explicitly filtered out using `mapToPublicUser` before any HTTP response is dispatched.

## 4. Rate Limiting
- A basic in-memory IP-based rate limiter has been implemented in `lib/middleware/rate-limiter.ts`.
- **Applied to**: `auth/login` (5 requests / 15 mins) and `auth/register` (5 requests / 15 mins) to prevent brute-force and enumeration attacks.
- *Note for Production*: If deployed to serverless edge platforms (like Vercel), in-memory Map rate-limiting is volatile across instances. Consider integrating Redis (e.g., Upstash) for distributed API rate limiting.

## 5. Error Handling & Stack Traces
- All errors are captured by a centralized wrapper `withApiHandler` (`lib/api/handler.ts`), which intercepts native errors and translates them into generic `500 Internal Server Error` API shapes. Stack traces are completely suppressed in API responses to prevent information leakage.

## 6. Dependency Audit (`npm audit`)
- Found a moderate vulnerability in a transitive dependency (`uuid < 11.1.1`) originating from the `firebase-admin@11.11.1` storage dependency tree (`gaxios` -> `teeny-request` -> `uuid`).
- **Resolution**: Ignored intentionally. Forcing an update (`npm audit fix --force`) downgrades `firebase-admin` to v10.3.0, introducing breaking API changes and destabilizing the modular configuration. We will await Google’s patch for the `firebase-admin` v11+ module tree.

## 7. CORS Configuration
- Kept at default configuration. The client domain origin should be configured explicitly in `next.config.ts` depending on the frontend deployment (e.g., restricting headers for API routes).

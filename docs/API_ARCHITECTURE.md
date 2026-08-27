# Movie Reservation System — Backend API Architecture

> **Version:** 1.0.0  
> **Stack:** Next.js 16 (App Router) · TypeScript · Firebase Firestore · JWT

---

## Overview

Backend Movie Reservation System dibangun sebagai **REST API** menggunakan Next.js App Router Route Handlers. API ini bersifat **UI-agnostic** dan dapat dikonsumsi oleh:
- **Web app** (Next.js frontend)
- **Mobile app** (Flutter)

---

## Layer Architecture

```
┌─────────────────────────────────────────────────┐
│         Client (Web / Flutter)                  │
└──────────────────┬──────────────────────────────┘
                   │ HTTP Request
┌──────────────────▼──────────────────────────────┐
│    Route Handler  (app/api/v1/...)               │
│    • Validates request (Zod)                    │
│    • Extracts auth via middleware                │
│    • Delegates to Service                       │
│    • Returns standardized Response              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    Service  (lib/modules/MODULE/MODULE.service)  │
│    • Business logic                             │
│    • Orchestrates multiple repositories         │
│    • Throws AppError subclasses                 │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Repository  (lib/modules/MODULE/MODULE.repo)    │
│    • Firestore data access                      │
│    • Maps Firestore docs ↔ Domain types         │
│    • Uses firestore-helpers.ts                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    Firebase Firestore  (lib/firebase/)           │
│    • Admin SDK (server-side only)               │
│    • Singleton initialization                   │
│    • Generic CRUD helpers                       │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
movie_projek/
├── app/
│   └── api/
│       ├── health/route.ts          # Health check (unversioned)
│       └── v1/                      # All production endpoints
│           ├── auth/                # Authentication
│           ├── movies/              # Public movie endpoints
│           ├── genres/              # Public genre endpoints
│           ├── cinemas/             # Public cinema endpoints
│           ├── studios/             # Studio endpoints
│           ├── showtimes/           # Showtime endpoints
│           ├── reservations/        # User reservations
│           ├── payments/            # Payment endpoints
│           ├── admin/               # Admin-only endpoints
│           └── debug/               # Dev-only debug endpoints
├── lib/
│   ├── api/
│   │   ├── errors.ts               # AppError subclasses
│   │   ├── response.ts             # Response builders
│   │   ├── handler.ts              # withApiHandler wrapper
│   │   └── index.ts                # Barrel export
│   ├── firebase/
│   │   ├── admin.ts                # Firebase Admin singleton
│   │   ├── firestore.ts            # Firestore instance + COLLECTIONS
│   │   └── firestore-helpers.ts   # Generic CRUD helpers
│   ├── middleware/
│   │   └── auth.ts                 # JWT auth middleware
│   ├── modules/
│   │   ├── users/                  # User domain
│   │   ├── auth/                   # Auth domain
│   │   ├── movies/                 # Movie domain
│   │   ├── genres/                 # Genre domain
│   │   ├── cinemas/                # Cinema domain
│   │   ├── studios/                # Studio domain
│   │   ├── seats/                  # Seat domain
│   │   ├── showtimes/              # Showtime domain
│   │   ├── reservations/           # Reservation domain
│   │   └── payments/               # Payment domain
│   ├── types/
│   │   └── api.ts                  # API response TypeScript types
│   └── validations/
│       └── common.ts               # Shared Zod schemas
├── docs/
│   └── API_ARCHITECTURE.md        # This file
└── tests/                          # Jest unit tests
```

---

## Conventions

### Naming

| Aspect | Convention | Example |
|---|---|---|
| File | `kebab-case` | `auth.service.ts` |
| Module folder | `kebab-case` | `lib/modules/movies/` |
| Class | `PascalCase` | `MoviesService` |
| Function | `camelCase` | `createMovie()` |
| Type/Interface | `PascalCase` | `Movie`, `CreateMovieInput` |
| Zod Schema | `camelCase` + `Schema` | `createMovieSchema` |
| Env var | `SCREAMING_SNAKE_CASE` | `FIREBASE_PROJECT_ID` |
| Collection | `snake_case` | `reservation_items` |
| API route | `kebab-case` | `/api/v1/now-showing` |

### Module File Structure

Each module follows this pattern:

```
lib/modules/MODULE/
  ├── MODULE.types.ts      # Domain types & interfaces
  ├── MODULE.schema.ts     # Zod validation schemas
  ├── MODULE.repository.ts # Firestore data access
  ├── MODULE.service.ts    # Business logic
  └── MODULE.mapper.ts     # Firestore doc → API response mapping
```

---

## API Conventions

### API Versioning

All production endpoints use `/api/v1/` prefix:
```
GET /api/v1/movies
GET /api/v1/movies/:id
POST /api/v1/auth/register
```

The `GET /api/health` endpoint is unversioned (infrastructure check).

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Movies fetched successfully",
  "data": { ... }
}
```

**Paginated Success:**
```json
{
  "success": true,
  "message": "Movies fetched successfully",
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "path": ["email"], "message": "Invalid email" }
  ]
}
```

### HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Successful GET, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE with no body |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 422 | Validation error (Zod) |
| 429 | Too many requests |
| 500 | Internal server error |
| 503 | Service unavailable |

### Pagination

Query parameters: `?page=1&limit=10`

Default: `page=1`, `limit=10`, max `limit=100`.

### Filtering & Sorting

```
GET /api/v1/movies?search=avengers&genre=action&status=NOW_SHOWING
GET /api/v1/movies?sortBy=releaseDate&sortOrder=desc
```

### IDs

All IDs are Firestore auto-generated document IDs (20-character alphanumeric strings).

### Timestamps

All timestamps are returned as **ISO 8601 strings** (UTC):
```json
"createdAt": "2026-08-25T07:00:00.000Z"
```

Stored in Firestore as `Timestamp` type using `FieldValue.serverTimestamp()`.

---

## Authentication & Authorization

### Mechanism

JWT Bearer token:
```
Authorization: Bearer <access_token>
```

### Token Lifecycle

| Token | TTL | Storage |
|---|---|---|
| Access Token | 15 minutes | Memory / Secure Storage |
| Refresh Token | 7 days | Secure Storage |

### Roles

| Role | Description |
|---|---|
| `USER` | Default role for registered users |
| `ADMIN` | Full administrative access |

### Middleware

```typescript
// Protect any endpoint
requireAuth()    // Must be authenticated
requireRole("ADMIN")  // Must have ADMIN role
```

---

## Firestore Collections

```
users               ← User accounts
movies              ← Film catalog
genres              ← Genre taxonomy
cinemas             ← Cinema locations
studios             ← Screening rooms per cinema
seats               ← Individual seats per studio
showtimes           ← Scheduled screenings
reservations        ← User bookings
reservation_items   ← Seat items per reservation
payments            ← Payment records
reviews             ← User reviews for movies
notifications       ← User notifications
```

### Data Integrity Rules

1. **No soft-delete by default** — use `isActive: false` for deactivation
2. **Movies with reservations** — can be set to ENDED but not deleted if referenced
3. **Seats** — permanent seat `status` is AVAILABLE/INACTIVE; booking state is computed from reservations
4. **Double booking prevention** — handled via Firestore atomic transactions

---

## Error Handling

All route handlers are wrapped with `withApiHandler()` which:
1. Catches `ZodError` → 422 with field-level errors
2. Catches `ValidationError` → 422
3. Catches `AppError` subclasses → maps to their HTTP status
4. Catches unknown errors → 500 (no internal detail leaked)

```typescript
export const GET = withApiHandler(async (req) => {
  // throw NotFoundError("Movie not found") → 404
  // throw UnauthorizedError() → 401
  // throw ZodError → 422
  // throw Error("db crash") → 500
});
```

---

## Development Endpoints

Available only when `NEXT_PUBLIC_APP_ENV !== 'production'`:

| Endpoint | Description |
|---|---|
| `GET /api/health` | Full health check |
| `GET /api/v1/debug/firestore` | Verify Firestore connection & collections |

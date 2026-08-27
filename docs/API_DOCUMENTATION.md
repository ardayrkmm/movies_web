# Movie Reservation System API Documentation

Base URL: `/api/v1`

## Overview

This API uses JSON for requests and responses. All endpoints (except public ones) require authentication via a JWT Bearer token.
Standard response wrapper:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... } // Or array of items for paginated endpoints
}
```

For paginated endpoints, `data` includes `items` and `pagination`:
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "items": [],
    "pagination": { "total": 100, "page": 1, "limit": 10, "totalPages": 10, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

---

## 1. Authentication

### Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth**: Public
- **Rate Limit**: 5 req / 15 min
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "08123456789"
  }
  ```
- **Validation**: Email must be valid, password must meet strength criteria.
- **Success Response**: `201 Created` with User object (no passwordHash) + `accessToken` + `refreshToken`.
- **Error Response**: `400 Bad Request` (Zod validation), `409 Conflict` (Email exists).
- **Business Rule**: Automatically assigns `USER` role. Password hashed via bcrypt (12 rounds).

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth**: Public
- **Rate Limit**: 5 req / 15 min
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response**: `200 OK` with User object + tokens.
- **Error Response**: `401 Unauthorized` (Invalid credentials or inactive account).

### Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth**: Public (stateless JWT, client drops token)
- **Success Response**: `200 OK`

### Get Current Session (Me)
- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth**: Required (Any role)
- **Success Response**: `200 OK` with User object.
- **Error Response**: `401 Unauthorized` (Missing or invalid token).

### Refresh Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth**: Public
- **Body**: `{ "refreshToken": "string" }`
- **Success Response**: `200 OK` with new `accessToken` and `refreshToken`.
- **Error Response**: `401 Unauthorized`.

---

## 2. Users

### Get My Profile
- **URL**: `/users/me`
- **Method**: `GET`
- **Auth**: Required (Any role)
- **Success Response**: `200 OK` with full public user profile.

### Update My Profile
- **URL**: `/users/me`
- **Method**: `PATCH`
- **Auth**: Required (Any role)
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "phone": "+628123456789",
    "photoUrl": "https://example.com/photo.jpg"
  }
  ```
- **Validation**: Email cannot be updated via this endpoint.
- **Success Response**: `200 OK` with updated profile.

### Get My Booking History
- **URL**: `/users/me/reservations`
- **Method**: `GET`
- **Auth**: Required (Any role)
- **Query Params**:
  - `status` (optional): Filter by reservation status.
  - `date` (optional): Filter by date (`YYYY-MM-DD`).
  - `page` (default: 1)
  - `limit` (default: 10)
- **Success Response**: `200 OK` with paginated reservations (includes nested movie, cinema, and studio data).

---

## 3. Movies

### List Movies
- **URL**: `/movies`
- **Method**: `GET`
- **Auth**: Public
- **Query Params**:
  - `search` (optional)
  - `genre` (optional)
  - `status` (optional): `UPCOMING` | `NOW_SHOWING` | `ENDED`
  - `ageRating` (optional)
  - `sortBy` (optional): `newest` | `releaseDate` | `title`
  - `page`, `limit`
- **Success Response**: `200 OK` (Paginated list of movies).

### Get Movie Details
- **URL**: `/movies/:id`
- **Method**: `GET`
- **Auth**: Public
- **Path Param**: `id`
- **Success Response**: `200 OK` with Movie object.
- **Error Response**: `404 Not Found`.

### Now Showing
- **URL**: `/movies/now-showing`
- **Method**: `GET`
- **Auth**: Public
- **Success Response**: `200 OK` (Filtered by `NOW_SHOWING`).

### Upcoming
- **URL**: `/movies/upcoming`
- **Method**: `GET`
- **Auth**: Public
- **Success Response**: `200 OK` (Filtered by `UPCOMING`).

---

## 4. Genres

### List Genres
- **URL**: `/genres`
- **Method**: `GET`
- **Auth**: Public
- **Success Response**: `200 OK` (Paginated list of genres).

### Get Genre
- **URL**: `/genres/:id`
- **Method**: `GET`
- **Auth**: Public
- **Success Response**: `200 OK`.

---

## 5. Reviews

### Get Movie Reviews
- **URL**: `/movies/:movieId/reviews`
- **Method**: `GET`
- **Auth**: Public
- **Query Params**: `page`, `limit`
- **Success Response**: `200 OK` (Paginated, includes reviewer name & photo).

### Create Review
- **URL**: `/movies/:movieId/reviews`
- **Method**: `POST`
- **Auth**: Required (USER)
- **Body**:
  ```json
  {
    "reservationId": "res-123",
    "rating": 5,
    "comment": "Amazing experience!"
  }
  ```
- **Validation**: Rating 1-5.
- **Business Rules**: 
  - User must own the reservation.
  - Reservation must be for this specific movie.
  - Reservation status must be `PAID` or `CONFIRMED`.
  - The showtime (`startAt`) must be in the past.
  - Max 1 review per user per movie.
- **Success Response**: `201 Created`.

### Update Review
- **URL**: `/reviews/:id`
- **Method**: `PATCH`
- **Auth**: Required
- **Body**: `rating` (optional), `comment` (optional)
- **Business Rule**: User can only edit their own review. Movie average rating automatically recalculates.

### Delete Review (User)
- **URL**: `/reviews/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Business Rule**: User can only delete their own review.
- **Success Response**: `204 No Content`.

---

## 6. Notifications

### List My Notifications
- **URL**: `/notifications`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**: `isRead` (boolean, optional), `page`, `limit`.
- **Success Response**: `200 OK`.

### Mark Read
- **URL**: `/notifications/:id/read`
- **Method**: `PATCH`
- **Auth**: Required
- **Business Rule**: Can only mark own notification. Idempotent operation.
- **Success Response**: `200 OK`.

### Mark All Read
- **URL**: `/notifications/read-all`
- **Method**: `PATCH`
- **Auth**: Required
- **Success Response**: `200 OK` (Returns count of affected rows).

---

## 7. Admin Dashboard

*All endpoints under `/admin/*` require the `ADMIN` role.*

### Dashboard Macro Stats
- **URL**: `/admin/dashboard/stats`
- **Method**: `GET`
- **Auth**: Required (ADMIN)
- **Success Response**: `200 OK` with counts for users, movies, cinemas, showtimes, reservations (grouped by status), and total revenue (sum of PAID). Note: Aggregates computed server-side to avoid full collection scans.

### Revenue Analytics
- **URL**: `/admin/dashboard/revenue`
- **Method**: `GET`
- **Auth**: Required (ADMIN)
- **Query Params**: `period` (`today`, `this_week`, `this_month`, `custom`), `startDate`, `endDate`.
- **Success Response**: `200 OK` with total revenue and transaction count.

### Reservation Analytics
- **URL**: `/admin/dashboard/reservations`
- **Method**: `GET`
- **Auth**: Required (ADMIN)
- **Query Params**: Same as revenue.
- **Success Response**: `200 OK` with status breakdowns.

### Popular Movies
- **URL**: `/admin/dashboard/popular-movies`
- **Method**: `GET`
- **Auth**: Required (ADMIN)
- **Query Params**: `limit` (max 20).
- **Success Response**: `200 OK` (Ordered by average `rating` and `reviewCount`).

### Moderate Review
- **URL**: `/admin/reviews/:id`
- **Method**: `DELETE`
- **Auth**: Required (ADMIN)
- **Success Response**: `204 No Content`. Movie stats automatically re-aggregate.

---

> **Note**: Service logic for `Cinemas`, `Studios`, `Seats`, `Showtimes`, `Reservations`, and `Payments` have been strictly implemented and validated via test suites at the backend layer, but their respective REST API route wrappers (e.g. `POST /cinemas`) are pending implementation at the edge layer and are omitted from this documentation.

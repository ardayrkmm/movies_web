/**
 * GET /api/v1/movies
 *
 * Mengembalikan daftar movie dengan filter dan pagination.
 *
 * Query params:
 *   search, genre, status, ageRating, sortBy, sortOrder, page, limit
 */

import { withApiHandler } from '@/lib/api/handler'
import { paginatedResponse } from '@/lib/api/response'
import { movieFiltersSchema } from '@/lib/modules/movies/movies.schema'
import { MoviesService } from '@/lib/modules/movies/movies.service'

export const dynamic = 'force-dynamic'

const moviesService = new MoviesService()

export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url)
  const rawParams = Object.fromEntries(url.searchParams.entries())
  const filters = movieFiltersSchema.parse(rawParams)

  const result = await moviesService.listMovies(filters)
  return paginatedResponse(result.items, result.total, result.page, result.limit, 'Movies fetched successfully')
})

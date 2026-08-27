/**
 * GET /api/v1/genres
 *
 * Mengembalikan semua genre.
 */

import { withApiHandler } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/response'
import { GenresService } from '@/lib/modules/genres/genres.service'

export const dynamic = 'force-dynamic'

const genresService = new GenresService()

export const GET = withApiHandler(async (_req: Request) => {
  const genres = await genresService.listGenres()
  return successResponse(genres, 'Genres fetched successfully')
})

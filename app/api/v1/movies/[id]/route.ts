/**
 * GET /api/v1/movies/[id]
 *
 * Mengembalikan detail movie berdasarkan ID.
 */

import { withApiHandler } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/response'
import { MoviesService } from '@/lib/modules/movies/movies.service'

export const dynamic = 'force-dynamic'

const moviesService = new MoviesService()

export const GET = withApiHandler(
  async (_req: Request, ctx?: { params?: Promise<Record<string, string>> }) => {
    const { id } = await ctx!.params!
    const movie = await moviesService.getMovieById(id)
    return successResponse(movie, 'Movie fetched successfully')
  }
)

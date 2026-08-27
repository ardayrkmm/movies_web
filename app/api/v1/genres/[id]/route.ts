/**
 * GET /api/v1/genres/[id]
 *
 * Mengembalikan genre berdasarkan ID.
 */

import { withApiHandler } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/response'
import { GenresService } from '@/lib/modules/genres/genres.service'

export const dynamic = 'force-dynamic'

const genresService = new GenresService()

export const GET = withApiHandler(
  async (_req: Request, ctx?: { params?: Promise<Record<string, string>> }) => {
    const { id } = await ctx!.params!
    const genre = await genresService.getGenreById(id)
    return successResponse(genre, 'Genre fetched successfully')
  }
)

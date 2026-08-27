/**
 * GET /api/v1/movies/now-showing
 *
 * Mengembalikan daftar movie yang sedang tayang.
 *
 * Query params: page, limit
 */

import { withApiHandler } from '@/lib/api/handler'
import { paginatedResponse } from '@/lib/api/response'
import { z } from 'zod'
import { MoviesService } from '@/lib/modules/movies/movies.service'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
})

const moviesService = new MoviesService()

export const GET = withApiHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { page, limit } = querySchema.parse(Object.fromEntries(url.searchParams.entries()))

  const result = await moviesService.getNowShowing(page, limit)
  return paginatedResponse(result.items, result.total, result.page, result.limit, 'Now showing movies fetched successfully')
})

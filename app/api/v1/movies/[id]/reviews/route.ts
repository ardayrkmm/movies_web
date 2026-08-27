import { withApiHandler } from "@/lib/api/handler";
import { successResponse, paginatedResponse, createdResponse } from "@/lib/api/response";
import { optionalAuth, requireAuth } from "@/lib/middleware/auth";
import { ReviewsService } from "@/lib/modules/reviews/reviews.service";
import { createReviewSchema } from "@/lib/modules/reviews/reviews.schema";
import { z } from "zod";
import { searchParamsToObject } from "@/lib/validations/common";

export const dynamic = "force-dynamic";

const reviewsService = new ReviewsService();

const querySchema = z.object({
  page: z.string().optional().default("1").transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default("10").transform(Number).pipe(z.number().int().min(1).max(50)),
});

export const GET = withApiHandler(async (req, ctx) => {
  const { id } = await ctx!.params!;
  const { searchParams } = new URL(req.url);
  const query = querySchema.parse(searchParamsToObject(searchParams));
  
  const result = await reviewsService.getMovieReviews(id, query.page, query.limit);
  
  return paginatedResponse(
    result.items,
    result.total,
    result.page,
    result.limit,
    "Reviews retrieved successfully"
  );
});

export const POST = withApiHandler(async (req, ctx) => {
  const user = requireAuth(req);
  const { id } = await ctx!.params!;
  const body = await req.json();
  const input = createReviewSchema.parse(body);
  
  const review = await reviewsService.createReview(user.userId, {
      ...input,
      movieId: id
  });
  
  return createdResponse(review, "Review created successfully");
});

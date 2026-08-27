import { withApiHandler } from "@/lib/api/handler";
import { successResponse, noContentResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { ReviewsService } from "@/lib/modules/reviews/reviews.service";
import { updateReviewSchema } from "@/lib/modules/reviews/reviews.schema";

export const dynamic = "force-dynamic";

const reviewsService = new ReviewsService();

export const PATCH = withApiHandler(async (req, ctx) => {
  const user = requireAuth(req);
  const { id } = await ctx!.params!;
  const body = await req.json();
  const input = updateReviewSchema.parse(body);
  
  const updated = await reviewsService.updateReview(id, user.userId, input);
  return successResponse(updated, "Review updated successfully");
});

export const DELETE = withApiHandler(async (req, ctx) => {
  const user = requireAuth(req);
  const { id } = await ctx!.params!;
  
  await reviewsService.deleteReview(id, user.userId, user.role);
  return noContentResponse();
});

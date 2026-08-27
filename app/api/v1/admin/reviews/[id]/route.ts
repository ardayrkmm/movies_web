import { withApiHandler } from "@/lib/api/handler";
import { noContentResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { ReviewsService } from "@/lib/modules/reviews/reviews.service";

export const dynamic = "force-dynamic";

const reviewsService = new ReviewsService();

export const DELETE = withApiHandler(async (req, ctx) => {
  const user = requireRole(req, "ADMIN");
  const { id } = await ctx!.params!;
  
  await reviewsService.deleteReview(id, user.userId, user.role);
  return noContentResponse();
});

import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { PaymentsService } from "@/lib/modules/payments/payments.service";

export const dynamic = "force-dynamic";

const paymentsService = new PaymentsService();

export const GET = withApiHandler(async (req, context) => {
  const user = requireAuth(req);
  const params = await context?.params;
  const id = params?.id as string;
  
  const payment = await paymentsService.getPaymentById(id, user.userId, user.role);
  
  return successResponse(payment, "Payment fetched successfully");
});

export const DELETE = withApiHandler(async (req, context) => {
  const user = requireAuth(req);
  const params = await context?.params;
  const id = params?.id as string;
  
  const cancelled = await paymentsService.cancelPayment(id, user.userId, user.role);
  
  return successResponse(cancelled, "Payment cancelled successfully");
});

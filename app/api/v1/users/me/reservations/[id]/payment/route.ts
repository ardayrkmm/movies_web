import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/middleware/auth";
import { PaymentsService } from "@/lib/modules/payments/payments.service";
import { createPaymentSchema } from "@/lib/modules/payments/payments.schema";

export const dynamic = "force-dynamic";

const paymentsService = new PaymentsService();

export const POST = withApiHandler(async (req, context) => {
  const user = requireAuth(req);
  const params = await context?.params;
  const id = params?.id as string;
  
  const body = await req.json();
  const input = createPaymentSchema.parse(body);
  
  const payment = await paymentsService.initiatePayment(id, user.userId, {
      ...input,
      reservationId: id
  });
  
  return successResponse(payment, "Payment initiated successfully");
});

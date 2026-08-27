import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { PaymentsService } from "@/lib/modules/payments/payments.service";

const paymentsService = new PaymentsService();

export const POST = withApiHandler(async (req) => {
  const body = await req.json();
  const { transactionId, status, paidAt } = body;
  
  if (!transactionId || !status) {
    throw new Error("transactionId and status are required");
  }

  await paymentsService.handleWebhook(transactionId, status, paidAt);
  
  return successResponse(null, "Webhook processed");
});

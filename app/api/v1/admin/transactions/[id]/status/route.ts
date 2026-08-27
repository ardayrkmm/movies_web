import { withApiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";
import { requireRole } from "@/lib/middleware/auth";
import { ReservationsRepository } from "@/lib/modules/reservations/reservations.repository";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (req, context) => {
  requireRole(req, "ADMIN");
  
  const { id } = await context.params;
  const body = await req.json();
  const { status } = body;
  
  if (!['PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(status)) {
     throw new Error("Invalid status");
  }

  const repo = new ReservationsRepository();
  const updated = await repo.updateStatus(id, status);
  
  if (!updated) {
     throw new Error("Transaction not found");
  }

  return successResponse(updated, "Transaction status updated successfully");
});

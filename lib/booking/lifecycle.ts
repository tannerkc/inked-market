import type { DepositStatus } from "@/lib/types/booking";

/**
 * What happens to a PAID deposit on cancellation. Provider-initiated
 * cancellations always owe a refund; customer cancellations honor the
 * artist's cancellation window (inside the window the deposit is forfeited
 * — that is the whole point of deposits).
 */
export function refundDecision(input: {
  depositStatus: DepositStatus;
  cancelledBy: "customer" | "artist" | "studio";
  startAt: string;
  cancellationWindowHours: number;
  now: Date;
}): "refund_due" | "forfeit" | "none" {
  if (input.depositStatus !== "paid") return "none";
  if (input.cancelledBy !== "customer") return "refund_due";
  const cutoffMs = Date.parse(input.startAt) - input.cancellationWindowHours * 3_600_000;
  return input.now.getTime() <= cutoffMs ? "refund_due" : "forfeit";
}

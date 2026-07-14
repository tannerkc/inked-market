/** Which booking flows an entity currently offers — drives the /book chooser. */
export type BookingFlowKind = "custom" | "consultation" | "flash";

export function enabledBookingFlows(s: {
  acceptingBookings: boolean;
  customRequestsEnabled: boolean;
  consultationsEnabled: boolean;
  flashEnabled: boolean;
}): BookingFlowKind[] {
  if (!s.acceptingBookings) return [];
  const flows: BookingFlowKind[] = [];
  if (s.customRequestsEnabled) flows.push("custom");
  if (s.consultationsEnabled) flows.push("consultation");
  if (s.flashEnabled) flows.push("flash");
  return flows;
}

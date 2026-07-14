/** Which booking flows an entity currently offers — drives the /book chooser. */
export type BookingFlowKind = "custom" | "consultation" | "flash";

export type BookingCta =
  | { kind: "inbuilt" }
  | { kind: "external"; url: string; domain: string }
  | { kind: "message" };

/** The one CTA resolver: what a customer-facing surface should show. */
export function bookingCtaFor(
  s: {
    bookingMode: "inbuilt" | "external" | "off" | null;
    acceptingBookings: boolean;
    customRequestsEnabled: boolean;
    consultationsEnabled: boolean;
    flashEnabled: boolean;
    externalBookingUrl: string | null;
  } | null
): BookingCta {
  if (!s) return { kind: "message" };
  if (s.bookingMode === "inbuilt" && s.acceptingBookings && enabledBookingFlows(s).length > 0) {
    return { kind: "inbuilt" };
  }
  if (s.bookingMode === "external" && s.externalBookingUrl?.startsWith("https://")) {
    try {
      return {
        kind: "external",
        url: s.externalBookingUrl,
        domain: new URL(s.externalBookingUrl).hostname.replace(/^www\./, ""),
      };
    } catch {
      return { kind: "message" };
    }
  }
  return { kind: "message" };
}

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

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FrontDeskSchema } from "@/lib/validation/schemas";
import { requireStudioOwner } from "@/lib/integrations/route-helpers";
import { artistUserId, notifyUser } from "@/lib/booking/notify";

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Front-desk manual booking: a granted roster artist or a studio walk-in.
 * Deliberately allowed OUTSIDE online availability windows (phone-booking
 * judgment call) — only the artist exclusion constraint guards double-books.
 * Walk-in customers usually have no account: customer_id stays null and
 * customer_name carries the identity.
 */
export async function frontDeskCreateAppointment(input: unknown): Promise<ActionResult> {
  const parsed = FrontDeskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid booking." };
  }
  const owner = await requireStudioOwner();
  if (!owner.ok) return { success: false, error: "Sign in as a studio owner first." };

  const d = parsed.data;
  const supabase = await createClient();

  if (d.artistId) {
    // The artist must have granted front-desk booking to THIS studio.
    const { data: grant } = await supabase
      .from("affiliations")
      .select("id")
      .eq("artist_id", d.artistId)
      .eq("studio_id", owner.studioId)
      .eq("status", "active")
      .eq("manage_bookings", true)
      .maybeSingle();
    if (!grant) {
      return { success: false, error: "That artist has not granted front-desk booking." };
    }
  }

  // Studio timezone from its booking settings (default Eastern).
  const { data: settings } = await createAdminClient()
    .from("booking_settings")
    .select("timezone")
    .eq(d.artistId ? "artist_id" : "studio_id", d.artistId ?? owner.studioId)
    .maybeSingle();
  const timezone = settings?.timezone ?? "America/New_York";

  const startMs = Date.parse(d.startAt);
  const { error } = await supabase.from("appointments").insert({
    customer_id: null,
    customer_name: d.customerName,
    artist_id: d.artistId ?? null,
    studio_id: owner.studioId,
    type: d.type,
    start_at: new Date(startMs).toISOString(),
    end_at: new Date(startMs + d.durationMin * 60_000).toISOString(),
    timezone,
    status: "confirmed",
    deposit_cents: 0,
    deposit_status: "not_required",
    notes: d.notes ?? null,
  });
  if (error) {
    if (error.code === "23P01") {
      return { success: false, error: "That artist is already booked then." };
    }
    return { success: false, error: "Something went wrong — try again." };
  }
  if (d.artistId) {
    const admin = createAdminClient();
    await notifyUser(admin, await artistUserId(admin, d.artistId), "appointment_booked", {
      actorName: `Front desk (${d.customerName})`,
      apptType: d.type,
      whenIso: new Date(startMs).toISOString(),
    });
  }
  return { success: true };
}

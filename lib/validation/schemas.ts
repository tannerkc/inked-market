import { z } from "zod";

const optionalBooleanFlag = z
  .literal("true")
  .optional()
  .transform((v) => (v === "true" ? true : undefined));

export const SearchParamsSchema = z.object({
  tab: z.enum(["artists", "studios"]).default("artists"),
  q: z.string().max(200).optional(),
  styles: z
    .string()
    .max(500)
    .optional()
    .transform((s) =>
      s ? s.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
    ),
  location: z.string().max(100).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  experience: z.enum(["1-3", "3-5", "5-10", "10+"]).optional(),
  verified: optionalBooleanFlag,
  booking: optionalBooleanFlag,
  sort: z.enum(["relevance", "rating", "reviews", "newest"]).default("relevance"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const ClaimRequestSchema = z.object({
  studioId: z.string().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(254),
});

export type ClaimRequest = z.infer<typeof ClaimRequestSchema>;

export const ContactFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  topic: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
});

export type ContactForm = z.infer<typeof ContactFormSchema>;

// ─── Booking (phase 2: custom requests) ────────────────────────────────────

const isoDatetime = z.string().datetime();
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const SubmitBookingRequestSchema = z.object({
  artistId: z.string().uuid(),
  description: z.string().trim().min(20, "Tell the artist a bit more (20+ characters)").max(3000),
  placement: z.string().trim().max(100).optional(),
  sizeCategory: z.enum(["small", "medium", "large", "xl"]).optional(),
  budgetRange: z.enum(["under-300", "300-600", "600-1200", "1200-plus"]).optional(),
  color: z.enum(["color", "black-grey"]).optional(),
  referenceImageUrls: z.array(z.string().url()).max(5).default([]),
  preferredTiming: z.string().trim().max(200).optional(),
  flexibleDates: z.boolean().default(true),
  isMultiSession: z.boolean().default(false),
  estimatedSessions: z.number().int().min(2).max(20).optional(),
});
export type SubmitBookingRequestInput = z.infer<typeof SubmitBookingRequestSchema>;

const proposedTimeSchema = z
  .object({ startAt: isoDatetime, endAt: isoDatetime })
  .refine((t) => Date.parse(t.startAt) < Date.parse(t.endAt), {
    message: "Time block ends before it starts",
  });

// NOTE: zod v3 discriminatedUnion options must be plain ZodObject (no .refine
// on a branch) — cross-field rules live in a union-level .superRefine.
export const RespondToRequestSchema = z
  .discriminatedUnion("action", [
    z.object({
      action: z.literal("decline"),
      requestId: z.string().uuid(),
      responseMessage: z.string().trim().max(1000).optional(),
    }),
    z.object({
      action: z.literal("accept"),
      requestId: z.string().uuid(),
      responseMessage: z.string().trim().max(1000).optional(),
      quoteMinCents: z.number().int().min(0).max(10_000_000).optional(),
      quoteMaxCents: z.number().int().min(0).max(10_000_000).optional(),
      depositCents: z.number().int().min(0).max(10_000_000).optional(),
      schedulingMode: z.enum(["propose", "open_calendar"]),
      sessionDurationMin: z.number().int().min(30).max(720).optional(),
      proposedTimes: z.array(proposedTimeSchema).max(3).default([]),
    }),
  ])
  .superRefine((d, ctx) => {
    if (d.action !== "accept") return;
    if (d.schedulingMode === "propose" && d.proposedTimes.length === 0) {
      ctx.addIssue({ code: "custom", message: "Offer at least one time" });
    }
    if (d.schedulingMode === "open_calendar" && d.sessionDurationMin === undefined) {
      ctx.addIssue({ code: "custom", message: "Set a session length for open-calendar booking" });
    }
    if (
      d.quoteMinCents !== undefined &&
      d.quoteMaxCents !== undefined &&
      d.quoteMinCents > d.quoteMaxCents
    ) {
      ctx.addIssue({ code: "custom", message: "Quote minimum exceeds maximum" });
    }
  });
export type RespondToRequestInput = z.infer<typeof RespondToRequestSchema>;

export const ScheduleFromRequestSchema = z.object({
  requestId: z.string().uuid(),
  startAt: isoDatetime,
  endAt: isoDatetime,
});
export type ScheduleFromRequestInput = z.infer<typeof ScheduleFromRequestSchema>;

export const SlotsQuerySchema = z
  .object({
    artistId: z.string().uuid(),
    durationMin: z.coerce.number().int().min(15).max(720),
    from: dateOnly,
    to: dateOnly,
  })
  .refine(
    (q) => {
      const days =
        (Date.parse(`${q.to}T00:00:00Z`) - Date.parse(`${q.from}T00:00:00Z`)) / 86_400_000;
      return days >= 0 && days <= 45;
    },
    { message: "Date range must be 0-45 days" }
  );

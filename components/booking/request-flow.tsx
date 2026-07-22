"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import { submitBookingRequest } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BookableRosterArtist } from "@/lib/data/supabase-booking";
import { ArtistPicker } from "./artist-picker";
import { BoxedInput, ChipGroup, FieldLabel, ToggleRow } from "./form-rows";
import { FlowHeader } from "./flow-header";
import { SignInGate } from "./sign-in-gate";
import { StepList } from "./step-list";

const MIN_DESCRIPTION = 20;
const MAX_REFS = 5;

const SIZES = [
  { value: "small", label: "Small · under 3\"" },
  { value: "medium", label: "Medium · 3-6\"" },
  { value: "large", label: "Large · 6-10\"" },
  { value: "xl", label: "Extra large" },
];

const BUDGETS = [
  { value: "under-300", label: "Under $300" },
  { value: "300-600", label: "$300-600" },
  { value: "600-1200", label: "$600-1,200" },
  { value: "1200-plus", label: "$1,200+" },
];

const COLORS = [
  { value: "color", label: "Color" },
  { value: "black-grey", label: "Black & grey" },
];

const STEPS = [
  { title: "Your idea", hint: "What do you want tattooed?" },
  { title: "The details", hint: "All optional — helps with an accurate quote" },
  { title: "Timing", hint: "When could this happen?" },
];

function StepHeader({ step }: { step: number }) {
  const s = STEPS[step];
  if (!s) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-rust">
          Step {step + 1} of {STEPS.length}
        </p>
        <p className="font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">{s.hint}</p>
      </div>
      <div className="h-px w-full bg-ink-black/[0.06] dark:bg-ink-cream/[0.08]">
        <div
          className="h-px bg-ink-rust transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <h2 className="text-lg font-medium tracking-tight text-ink-black dark:text-ink-cream">
        {s.title}
      </h2>
    </div>
  );
}

interface BookingRequestFlowProps {
  entity: { artistId?: string; studioId?: string };
  entityName: string;
  acceptingRequests: boolean;
  /** True when rendered inside the /book chooser, which owns the heading. */
  embedded?: boolean;
  /** Studio targets only: roster artists pickable on the request form. */
  roster?: BookableRosterArtist[];
}

export function BookingRequestFlow({
  entity,
  entityName,
  acceptingRequests,
  embedded = false,
  roster,
}: BookingRequestFlowProps) {
  const { user, setViewMode } = useAuth();
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [placement, setPlacement] = useState("");
  const [size, setSize] = useState("");
  const [budget, setBudget] = useState("");
  const [color, setColor] = useState("");
  const [timing, setTiming] = useState("");
  const [flexible, setFlexible] = useState(true);
  const [multiSession, setMultiSession] = useState(false);
  const [refs, setRefs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Studio targets: "" means "Any artist" (the request stays with the studio).
  const [rosterArtistId, setRosterArtistId] = useState("");

  const chosenArtist = roster?.find((a) => a.id === rosterArtistId);
  // Direct picks land in the artist's own inbox; the rest stay with the studio.
  const targetName = chosenArtist?.direct ? chosenArtist.name : entityName;

  if (!acceptingRequests) {
    return (
      <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
        {entityName} is not taking custom requests right now.
      </p>
    );
  }
  if (!user) {
    return <SignInGate intent="request" entityName={entityName} />;
  }
  if (done) {
    return (
      <div className="space-y-5">
        <FlowHeader icon="check" title="Request sent">
          Your idea is with {targetName}. Here is what happens next:
        </FlowHeader>
        <StepList
          steps={[
            `${targetName} reviews your idea`,
            "You get a quote and proposed times",
            "A deposit locks in your appointment",
          ]}
        />
        <Button
          variant="ink"
          as={Link}
          href="/dashboard"
          onClick={() => setViewMode("customer")}
          className="min-h-[44px]"
        >
          Track it in your dashboard
        </Button>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    for (const file of Array.from(files).slice(0, MAX_REFS - refs.length)) {
      const result = await uploadBookingReference(supabase, user.id, file);
      if (result.ok) setRefs((prev) => [...prev, result.url]);
      else setError(result.error);
    }
    setUploading(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    // Artists running their own Inked booking get the request directly, like
    // booking from their page; everyone else stays a studio request with the
    // pick recorded for the front desk.
    const direct = chosenArtist?.direct ?? false;
    const result = await submitBookingRequest({
      artistId: entity.artistId ?? (direct ? chosenArtist?.id : undefined),
      studioId: direct ? undefined : entity.studioId,
      preferredArtistId: chosenArtist && !direct ? chosenArtist.id : undefined,
      description,
      placement: placement || undefined,
      sizeCategory: size || undefined,
      budgetRange: budget || undefined,
      color: color || undefined,
      referenceImageUrls: refs,
      preferredTiming: timing || undefined,
      flexibleDates: flexible,
      isMultiSession: multiSession,
    });
    setSubmitting(false);
    if (result.success) setDone(true);
    else setError(result.error ?? "Something went wrong.");
  };

  const charsLeft = MIN_DESCRIPTION - description.trim().length;
  const ideaReady = charsLeft <= 0;

  return (
    <div className="space-y-6">
      {embedded ? null : (
        <h1 className="text-xl font-medium">Request a booking with {entityName}</h1>
      )}

      <StepHeader step={step} />

      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <Textarea
              label="Describe your idea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subject, style, references you love, anything the artist should know"
              rows={5}
            />
            <p
              className={`mt-2 font-mono text-[10px] ${
                ideaReady
                  ? "text-ink-sage"
                  : "text-ink-black/30 dark:text-ink-cream/30"
              }`}
            >
              {ideaReady
                ? "Good to go"
                : description.length === 0
                  ? "A couple of sentences is plenty"
                  : `${charsLeft} more character${charsLeft === 1 ? "" : "s"} to continue`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <FieldLabel>Reference images</FieldLabel>
              <p className="font-mono text-[10px] text-ink-black/25 dark:text-ink-cream/25">
                Optional · {refs.length}/{MAX_REFS}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {refs.map((url) => (
                <div key={url} className="relative h-20 w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Reference"
                    className="h-20 w-20 rounded-xl border border-ink-black/[0.06] object-cover dark:border-ink-cream/[0.08]"
                  />
                  <button
                    type="button"
                    aria-label="Remove reference"
                    onClick={() => setRefs((prev) => prev.filter((u) => u !== url))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-black text-ink-cream transition-opacity hover:opacity-80 dark:bg-ink-cream dark:text-ink-black"
                  >
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                      <path d="M2 2l6 6M8 2l-6 6" />
                    </svg>
                  </button>
                </div>
              ))}
              {refs.length < MAX_REFS ? (
                <label
                  className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink-black/[0.15] text-ink-black/40 transition-colors hover:border-ink-rust hover:text-ink-rust dark:border-ink-cream/[0.15] dark:text-ink-cream/40 ${
                    uploading ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
                    {uploading ? "..." : "Add"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => void handleFiles(e.target.files)}
                    className="sr-only"
                  />
                </label>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5">
          {entity.studioId && roster && roster.length > 0 ? (
            <ArtistPicker roster={roster} value={rosterArtistId} onChange={setRosterArtistId} />
          ) : null}
          <BoxedInput
            label="Placement"
            value={placement}
            onChange={setPlacement}
            placeholder="Forearm, shoulder, calf..."
            maxLength={100}
          />
          <ChipGroup label="Size" value={size} options={SIZES} onChange={setSize} />
          <ChipGroup label="Budget" value={budget} options={BUDGETS} onChange={setBudget} />
          <ChipGroup label="Color" value={color} options={COLORS} onChange={setColor} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <BoxedInput
            label="Preferred timing"
            value={timing}
            onChange={setTiming}
            placeholder="Weekends, next month, whenever..."
            maxLength={200}
          />
          <ToggleRow
            label="Flexible on dates"
            hint="Open to whatever works for the artist"
            checked={flexible}
            onChange={setFlexible}
          />
          <ToggleRow
            label="Multi-session project"
            hint="Sleeve, back piece — work planned across several sittings"
            checked={multiSession}
            onChange={setMultiSession}
          />
        </div>
      ) : null}

      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="space-y-3">
        {step < STEPS.length - 1 ? (
          <Button
            variant="ink"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 ? !ideaReady || uploading : false}
            className="min-h-[44px] w-full"
            rightIcon="arrow-right"
          >
            Continue
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              variant="ink"
              onClick={() => void submit()}
              disabled={submitting || uploading || !ideaReady}
              className="min-h-[44px] w-full"
            >
              {submitting ? "Sending..." : `Send to ${targetName}`}
            </Button>
            <p className="text-center font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
              No payment now — you approve the quote first
            </p>
          </div>
        )}
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mx-auto block min-h-[44px] font-mono text-[11px] text-ink-black/40 transition-colors hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
          >
            Back to {STEPS[step - 1]?.title.toLowerCase()}
          </button>
        ) : null}
      </div>
    </div>
  );
}

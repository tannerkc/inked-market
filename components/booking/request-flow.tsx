"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import { submitBookingRequest } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, SelectRow, ToggleRow } from "./form-rows";

const SIZES = [
  { value: "", label: "Not sure" },
  { value: "small", label: "Small (under 3 in)" },
  { value: "medium", label: "Medium (3-6 in)" },
  { value: "large", label: "Large (6-10 in)" },
  { value: "xl", label: "Extra large / multi-region" },
];

const BUDGETS = [
  { value: "", label: "Not sure" },
  { value: "under-300", label: "Under $300" },
  { value: "300-600", label: "$300 - $600" },
  { value: "600-1200", label: "$600 - $1,200" },
  { value: "1200-plus", label: "$1,200+" },
];

const COLORS = [
  { value: "", label: "Not sure" },
  { value: "color", label: "Color" },
  { value: "black-grey", label: "Black & grey" },
];

interface BookingRequestFlowProps {
  entity: { artistId?: string; studioId?: string };
  entityName: string;
  acceptingRequests: boolean;
  /** True when rendered inside the /book chooser, which owns the heading. */
  embedded?: boolean;
}

export function BookingRequestFlow({
  entity,
  entityName,
  acceptingRequests,
  embedded = false,
}: BookingRequestFlowProps) {
  const { user } = useAuth();
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

  if (!acceptingRequests) {
    return (
      <p className="text-[14px] text-ink-black/60 dark:text-ink-cream/60">
        {entityName} is not taking custom requests right now.
      </p>
    );
  }
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-medium">Request a booking with {entityName}</h1>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          Sign in to send a request.
        </p>
        <Button variant="ink" as={Link} href="/login">
          Sign in
        </Button>
      </div>
    );
  }
  if (done) {
    return (
      <div className="space-y-4">
        {embedded ? (
          <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
            Request sent
          </p>
        ) : (
          <h1 className="text-xl font-medium">Request sent</h1>
        )}
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          {entityName} will review your idea and reply with a quote and times. Track it from your
          dashboard.
        </p>
        <Button variant="ink" as={Link} href="/dashboard">
          Go to dashboard
        </Button>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    for (const file of Array.from(files).slice(0, 5 - refs.length)) {
      const result = await uploadBookingReference(supabase, user.id, file);
      if (result.ok) setRefs((prev) => [...prev, result.url]);
      else setError(result.error);
    }
    setUploading(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await submitBookingRequest({
      artistId: entity.artistId,
      studioId: entity.studioId,
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

  return (
    <div className="space-y-6">
      {embedded ? null : (
        <h1 className="text-xl font-medium">Request a booking with {entityName}</h1>
      )}

      <Textarea
        label="Describe your idea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Subject, style, references you love, anything the artist should know (20+ characters)"
        rows={5}
      />

      <div className="flex min-h-[44px] items-center justify-between gap-3">
        <FieldLabel>Placement</FieldLabel>
        <input
          type="text"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          placeholder="Forearm, shoulder..."
          maxLength={100}
          className="min-h-[44px] w-44 rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
        />
      </div>
      <SelectRow label="Size" value={size} options={SIZES} onChange={setSize} />
      <SelectRow label="Budget" value={budget} options={BUDGETS} onChange={setBudget} />
      <SelectRow label="Color" value={color} options={COLORS} onChange={setColor} />

      <div>
        <FieldLabel>Reference images ({refs.length}/5)</FieldLabel>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || refs.length >= 5}
          onChange={(e) => void handleFiles(e.target.files)}
          className="mt-2 block w-full text-[12px]"
        />
        {refs.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {refs.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="Reference" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[44px] items-center justify-between gap-3">
        <FieldLabel>Preferred timing</FieldLabel>
        <input
          type="text"
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          placeholder="Weekends, next month..."
          maxLength={200}
          className="min-h-[44px] w-44 rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
        />
      </div>
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

      {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

      <Button
        variant="ink"
        onClick={() => void submit()}
        disabled={submitting || uploading || description.trim().length < 20}
        className="min-h-[44px] w-full"
      >
        {submitting ? "Sending..." : "Send request"}
      </Button>
    </div>
  );
}

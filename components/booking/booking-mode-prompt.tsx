"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchBookingSettings, resolveBookingEntity } from "@/lib/data/supabase-booking";
import { setBookingMode } from "@/app/book/actions";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "./form-rows";

interface BookingModePromptProps {
  /** Open the Booking Settings panel after choosing inbuilt. */
  onOpenSettings?: () => void;
}

/** One-time dashboard card: booking is never silently on. */
export function BookingModePrompt({ onOpenSettings }: BookingModePromptProps) {
  const supabaseRef = useRef(createClient());
  const [visible, setVisible] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const entity = await resolveBookingEntity(supabase);
      if (cancelled || !entity) return;
      const settings = await fetchBookingSettings(supabase, entity);
      if (cancelled) return;
      if (!settings || settings.bookingMode === null) {
        setVisible(true);
        // Studios with a connected scheduling tool get their link prefilled.
        if (entity.studioId) {
          const { data: studio } = await supabase
            .from("studios")
            .select("integrations")
            .eq("id", entity.studioId)
            .maybeSingle();
          if (cancelled) return;
          const integrations = (studio?.integrations ?? {}) as Record<
            string,
            { linkUrl?: string } | undefined
          >;
          const link = integrations.calendly?.linkUrl ?? integrations.square?.linkUrl ?? null;
          if (link?.startsWith("https://")) setSuggestedUrl(link);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  const choose = async (mode: "inbuilt" | "external" | "off", externalUrl?: string) => {
    setBusy(true);
    setError(null);
    const result = await setBookingMode({ mode, externalUrl });
    setBusy(false);
    if (result.success) {
      setVisible(false);
      if (mode === "inbuilt") onOpenSettings?.();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="mb-4 rounded-[14px] border border-dashed border-ink-rust/40 bg-ink-rust/[0.04] p-4">
      <FieldLabel>How do you want to take bookings?</FieldLabel>
      <p className="mt-1 text-[11px] text-ink-black/40 dark:text-ink-cream/40">
        This controls the Book button on your public page. You can change it any time in Booking
        Settings.
      </p>

      {externalOpen ? (
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={suggestedUrl ?? "https://calendly.com/your-page"}
            className="min-h-[44px] rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
          />
          {suggestedUrl && !url ? (
            <button
              type="button"
              onClick={() => setUrl(suggestedUrl)}
              className="self-start font-mono text-[10px] text-ink-rust hover:underline"
            >
              Use {suggestedUrl}
            </button>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="ink"
              size="sm"
              disabled={busy || !url.startsWith("https://")}
              onClick={() => void choose("external", url)}
            >
              Save link
            </Button>
            <Button variant="ink-outline" size="sm" onClick={() => setExternalOpen(false)}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="ink" size="sm" disabled={busy} onClick={() => void choose("inbuilt")}>
            Use Inked booking
          </Button>
          <Button
            variant="ink-outline"
            size="sm"
            disabled={busy}
            onClick={() => setExternalOpen(true)}
          >
            I use another tool
          </Button>
          <Button variant="ink-ghost" size="sm" disabled={busy} onClick={() => void choose("off")}>
            Not now
          </Button>
        </div>
      )}
      {error ? <p className="mt-2 text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

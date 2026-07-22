import { cn } from "@/lib/utils";
import { StatusBadge, BADGE_COLORS, type StatusBadgeColor } from "@/components/ui/status-badge";

/** Shared surfaces for the staff portal — same card idiom as Input/Select primitives. */
export const panelClass =
  "rounded-xl bg-white border border-ink-black/[0.06] dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08]";

export const microLabelClass =
  "font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/30 dark:text-ink-cream/30";

export function PanelTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-ink-black/80 dark:text-ink-cream/80">{title}</h2>
      {hint ? <p className="mt-0.5 text-[11px] text-ink-black/35 dark:text-ink-cream/35">{hint}</p> : null}
    </div>
  );
}

export function FeedbackMessage({ message }: { message: { text: string; ok: boolean } | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={cn(
        "mt-3 font-mono text-[10px] tracking-[0.1em] uppercase",
        message.ok ? "text-ink-sage" : "text-ink-red"
      )}
    >
      {message.text}
    </p>
  );
}

export function EmptyState({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="py-10 text-center">
      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 dark:text-ink-cream/25">
        {text}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

/** Consistent tier color encoding across the portal: magnum=red, shader=rust, liner=sage. */
const TIER_COLORS: Record<string, StatusBadgeColor> = {
  magnum: BADGE_COLORS.red,
  shader: BADGE_COLORS.rust,
  liner: BADGE_COLORS.sage,
};

export function TierBadge({ tier, comp }: { tier: string | null; comp?: boolean }) {
  const label = (tier ?? "free") + (comp ? " · comp" : "");
  return <StatusBadge label={label} color={tier ? TIER_COLORS[tier] ?? BADGE_COLORS.muted : BADGE_COLORS.muted} />;
}

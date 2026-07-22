"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { studioTiers, type SignupTierData } from "@/lib/data/signup-tiers";
import type { TierSlug } from "@/lib/types";

interface PublishPaywallDialogProps {
  isOpen: boolean;
  /** Called with the chosen paid plan — the caller upgrades, then completes its flow. */
  onSelectPlan: (slug: TierSlug) => void;
  onCancel: () => void;
  /** Tiers offered. Defaults to the custom-web-page tiers (the publish gate);
   *  the dashboard go-live gate passes all studio tiers since Liner qualifies. */
  tiers?: SignupTierData[];
  eyebrow?: string;
  body?: string;
  cancelLabel?: string;
}

/** Only the tiers that include a custom web page can publish one. */
const PUBLISH_TIERS = studioTiers.filter(
  (t) => t.slug === "shader" || t.slug === "magnum",
);

function CheckIcon({ included }: { included: boolean }) {
  return included ? (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-ink-red"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ) : (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="shrink-0 text-chrome-border-hover"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function TierCard({
  tier,
  onSelect,
}: {
  tier: SignupTierData;
  onSelect: () => void;
}) {
  const popular = tier.badge != null;
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col rounded-xl border p-5",
        popular
          ? "border-ink-red/60 bg-ink-red/[0.06]"
          : "border-chrome-border-hover bg-white/[0.02]",
      )}
    >
      {popular ? (
        <span className="absolute -top-2.5 left-5 rounded-full bg-ink-red px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-ink-red-glow">
          {tier.badge}
        </span>
      ) : null}

      <span className="font-[family-name:var(--font-permanent-marker)] text-[17px] tracking-wide text-chrome-text-primary">
        {tier.name}
      </span>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[22px] font-semibold leading-none text-chrome-text-primary">
          ${tier.price}
        </span>
        <span className="text-[11px] text-chrome-text-dim">/mo</span>
      </div>
      {tier.annualPrice != null ? (
        <span className="mt-1 text-[10.5px] text-chrome-text-dim">
          or ${tier.annualPrice}/mo billed annually
        </span>
      ) : null}

      <ul className="mt-4 mb-5 flex flex-col gap-2">
        {tier.features.map((f) => (
          <li
            key={f.text}
            className={cn(
              "flex items-center gap-2 text-[11.5px] leading-snug",
              f.included ? "text-chrome-text-secondary" : "text-chrome-text-dim line-through decoration-chrome-border-hover",
            )}
          >
            <CheckIcon included={f.included} />
            {f.text}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "mt-auto inline-flex h-10 items-center justify-center rounded-xl px-4 text-[12.5px] font-semibold transition-all active:scale-[0.99]",
          popular
            ? "bg-ink-red text-white shadow-ink-red-glow hover:brightness-110"
            : "border border-chrome-border-hover text-chrome-text-secondary hover:border-chrome-text-dim hover:text-chrome-text-primary",
        )}
      >
        Choose {tier.name}
      </button>
    </div>
  );
}

/**
 * Shown when a studio without an active Shader/Magnum plan hits Publish.
 * Their draft is already saved — picking a plan publishes it immediately.
 */
export function PublishPaywallDialog({
  isOpen,
  onSelectPlan,
  onCancel,
  tiers = PUBLISH_TIERS,
  eyebrow = "Publishing is a paid feature",
  body = "Your design is saved and waiting. Pick a plan with a custom web page and we’ll publish it the moment you do.",
  cancelLabel = "Not yet — keep designing",
}: PublishPaywallDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onCancel();
    },
    [onCancel],
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{ animation: "dialog-backdrop-in 180ms ease-out" }}
      className="fixed inset-0 z-[400] flex items-center justify-center overflow-y-auto p-4 bg-ink-black/70 backdrop-blur-md"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-paywall-title"
        aria-describedby="publish-paywall-body"
        style={{ animation: "dialog-pop-in 260ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={cn(
          "relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-chrome-muted bg-chrome-surface",
          "shadow-[0_24px_70px_-12px_rgba(0,0,0,0.8)]",
        )}
      >
        {/* Ink-red aura bleeding down from the top edge — brand atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-ink-red-glow-top"
        />
        {/* Machined-metal hairline highlight across the top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chrome-subtle to-transparent"
        />

        <div className="relative p-7">
          <div className="mb-5 flex items-center gap-2.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-red"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-red">
              {eyebrow}
            </span>
          </div>

          <h2
            id="publish-paywall-title"
            className="text-[19px] font-semibold leading-tight text-chrome-text-primary"
          >
            Ready to go live?
          </h2>
          <p
            id="publish-paywall-body"
            className="mt-2.5 text-[13px] leading-relaxed text-chrome-text-secondary"
          >
            {body}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {tiers.map((tier) => (
              <TierCard
                key={tier.slug}
                tier={tier}
                onSelect={() => onSelectPlan(tier.slug)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl text-[12.5px] font-medium text-chrome-text-dim transition-colors hover:text-chrome-text-light"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

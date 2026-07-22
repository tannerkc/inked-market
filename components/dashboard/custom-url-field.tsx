"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MIN_SLUG_LENGTH, sanitizeSlugInput } from "@/lib/utils/studio-slug";

export interface CustomUrlFieldProps {
  /** URL namespace the slug lives under. */
  basePath: "studios" | "artists";
  /** Current slug (the live public path segment). */
  slug: string;
  /** True once the one-shot customization has been used. */
  locked: boolean;
  /** True when no OTHER row already owns the candidate slug. */
  checkAvailable: (slug: string) => Promise<boolean>;
  /** Persist the new slug. Must throw on failure (trigger rejections included). */
  save: (slug: string) => Promise<void>;
  className?: string;
}

/**
 * One-shot custom URL editor (LinkedIn-style) shared by the studio and artist
 * settings panels. The DB trigger (migration 023) is the enforcement; this
 * component surfaces the lock state and races cleanly against it.
 */
export function CustomUrlField({
  basePath,
  slug,
  locked,
  checkAvailable,
  save,
  className,
}: CustomUrlFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Locks immediately after a successful save — the provider's cached row
  // won't have the trigger-stamped timestamp until the next reload.
  const [savedNow, setSavedNow] = useState(false);

  const isLocked = locked || savedNow;

  const startEdit = () => {
    setDraft(slug);
    setError(null);
    setEditing(true);
  };

  const submit = async () => {
    const next = draft.replace(/-+$/, "");
    if (next === slug) {
      setEditing(false);
      return;
    }
    if (next.length < MIN_SLUG_LENGTH) {
      setError(`Use at least ${MIN_SLUG_LENGTH} characters`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (!(await checkAvailable(next))) {
        setError("That URL is already taken");
        return;
      }
      await save(next);
      setSavedNow(true);
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("URL_ALREADY_CUSTOMIZED")
          ? "This URL was already customized once and can't change again."
          : "That URL is already taken"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[11px] font-medium uppercase tracking-wide text-ink-black/50 dark:text-ink-cream/50">
        Custom URL
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-ink-black/[0.08] bg-ink-black/[0.03] px-4 py-3 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.03]">
        <span className="shrink-0 select-none font-mono text-sm text-ink-black/35 dark:text-ink-cream/35">
          /{basePath}/
        </span>
        {editing ? (
          <input
            value={draft}
            disabled={saving}
            autoFocus
            onChange={(e) => {
              setDraft(sanitizeSlugInput(e.target.value));
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Custom URL path"
            placeholder="your-custom-url"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink-black outline-none placeholder:text-ink-black/25 disabled:opacity-60 dark:text-ink-cream dark:placeholder:text-ink-cream/25"
          />
        ) : (
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-ink-black/70 dark:text-ink-cream/70">
            {slug}
          </span>
        )}
        {editing ? (
          <span className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving}
              className="text-[11px] font-medium uppercase tracking-wide text-ink-red transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="text-[11px] font-medium uppercase tracking-wide text-ink-black/40 transition-opacity hover:opacity-70 disabled:opacity-40 dark:text-ink-cream/40"
            >
              Cancel
            </button>
          </span>
        ) : !isLocked ? (
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-red transition-opacity hover:opacity-70"
          >
            Change
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-[10px] font-medium text-ink-red">{error}</p>
      ) : (
        <p className="text-[10px] text-ink-black/30 dark:text-ink-cream/30">
          {isLocked
            ? "Your custom URL is set. URLs can only be customized once."
            : "You can customize your URL once — choose carefully. Old links to the previous URL will stop working."}
        </p>
      )}
    </div>
  );
}

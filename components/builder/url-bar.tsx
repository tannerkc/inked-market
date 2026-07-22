"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import { useStudio } from "@/lib/providers/studio-provider";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import { createClient } from "@/lib/supabase/client";
import {
  buildStudioSlug,
  sanitizeSlugInput,
  isSlugAvailable,
  MIN_SLUG_LENGTH,
} from "@/lib/utils/studio-slug";

/**
 * The fake browser URL bar — shows the studio's REAL public URL (actual
 * origin + actual DB slug) and lets owners customize the path inline,
 * LinkedIn-style. Falls back to the name-city-state slug the studio will
 * get on first save when no row exists yet. Rendered in the split-mode
 * browser chrome AND as a floating pill in inline mode.
 */
export function UrlBar({ className }: { className?: string }) {
  const { studio, useMockData, previewPage } = useBuilder();
  const { update } = useStudio();

  // Real origin (localhost in dev, the live domain in prod). The builder only
  // mounts client-side behind the auth guard, so window is present; the SSR
  // fallback never paints for real users.
  const [origin] = useState(() =>
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const [proto, host] = origin ? origin.split("://") : ["https", "inkedmarket.com"];

  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const generated = buildStudioSlug(data?.name ?? "", data?.city ?? undefined, data?.state ?? undefined);
  const slug = (!useMockData && studio?.slug) || generated || "your-studio";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The provider's cached row won't carry the trigger-stamped timestamp until
  // reload — lock locally the moment a customization lands.
  const [customizedNow, setCustomizedNow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Customizing requires a real row to rename; Sample mode shows demo data.
  // URLs are one-shot custom (migration 023) — hide the pencil once used.
  const canEdit =
    !useMockData &&
    Boolean(studio?.id) &&
    !studio?.slugCustomizedAt &&
    !customizedNow;
  const path = `/studios/${slug}${previewPage === "policies" ? "/policies" : ""}`;

  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    void navigator.clipboard.writeText(`${origin}${path}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const startEdit = () => {
    setDraft(slug);
    setError(null);
    setEditing(true);
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = async () => {
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
      const free = await isSlugAvailable(createClient(), "studios", next, studio?.id);
      if (!free) {
        setError("That URL is already taken");
        return;
      }
      await update({ slug: next });
      setCustomizedNow(true);
      setEditing(false);
    } catch (e) {
      // DB constraints are the race backstop — restore the old slug.
      void update({ slug });
      setError(
        e instanceof Error && e.message.includes("URL_ALREADY_CUSTOMIZED")
          ? "URLs can only be customized once"
          : "That URL is already taken"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-lg border border-chrome-muted bg-ink-black-raised px-3 py-[5px] min-w-[320px] max-w-[480px] w-full",
          className,
        )}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 self-center text-chrome-subtle">
          <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap text-[11px] leading-none font-mono text-chrome-text-tertiary">
          <span className="shrink-0 select-none text-chrome-text-faint">{proto}://</span>
          <span className="shrink-0 select-none text-chrome-text-secondary">{host}</span>
          <span className="shrink-0 select-none text-chrome-text-dim">/studios/</span>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              disabled={saving}
              onChange={(e) => {
                setDraft(sanitizeSlugInput(e.target.value));
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                if (e.key === "Escape") setEditing(false);
              }}
              aria-label="Custom studio URL path"
              className="min-w-0 flex-1 bg-transparent text-[11px] leading-none font-mono text-white outline-none placeholder:text-chrome-text-faint disabled:opacity-60"
              placeholder="your-studio-name"
            />
          ) : (
            <span className="min-w-0 overflow-hidden text-ellipsis text-chrome-text-dim select-none">
              {slug}
              {previewPage === "policies" ? "/policies" : ""}
            </span>
          )}
        </span>
        {editing ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              title="Save URL"
              className="flex h-5 w-5 items-center justify-center rounded text-chrome-text-secondary transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              title="Cancel"
              className="flex h-5 w-5 items-center justify-center rounded text-chrome-text-dim transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </span>
        ) : canEdit ? (
          <button
            type="button"
            onClick={startEdit}
            title="Customize your studio URL"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-chrome-text-dim transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
          </button>
        ) : null}
        {error ? (
          <span className="absolute top-full left-3 mt-1 rounded bg-ink-black-raised px-2 py-1 text-[10px] font-medium text-ink-red shadow-lg">
            {error}
          </span>
        ) : null}
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={copyUrl}
          title={copied ? "Copied" : "Copy URL"}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/10",
            copied ? "text-ink-sage" : "text-chrome-text-dim hover:text-white",
          )}
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </button>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          className="flex h-6 w-6 items-center justify-center rounded-md text-chrome-text-dim transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>
        </a>
      </div>
    </div>
  );
}

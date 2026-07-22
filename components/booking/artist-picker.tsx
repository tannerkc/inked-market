"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchArtistGalleryPreview } from "@/lib/data/supabase-artists";
import type { BookableRosterArtist } from "@/lib/data/supabase-booking";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { MetaChip } from "@/components/ui/meta-chip";
import { FieldLabel } from "./form-rows";

/** Above this roster size, pills give way to the searchable select. */
const PILL_LIMIT = 5;
const HOVER_DELAY_MS = 250;
const MAX_PILL_STYLES = 2;

const PILL_ACTIVE =
  "border-ink-black bg-ink-black text-ink-cream dark:border-ink-cream dark:bg-ink-cream dark:text-ink-black";
const PILL_IDLE =
  "border-ink-black/[0.08] text-ink-black/60 hover:border-ink-black/30 dark:border-ink-cream/[0.08] dark:text-ink-cream/60 dark:hover:border-ink-cream/30";
const ACTIVE_CHIP =
  "border-ink-cream/20 text-ink-cream/60 dark:border-ink-black/20 dark:text-ink-black/60";
const POPOVER_SURFACE =
  "rounded-[14px] border border-ink-black/[0.08] bg-white shadow-lg dark:border-ink-cream/[0.08] dark:bg-ink-black";

// Session-lived so re-hovers and re-mounts never refetch.
const galleryCache = new Map<string, string[]>();

/** Facebook-style profile peek: header + a small portfolio grid, fetched lazily. */
function ArtistHoverCard({ artist }: { artist: BookableRosterArtist }) {
  const [images, setImages] = useState<string[] | null>(
    () => galleryCache.get(artist.id) ?? null
  );

  useEffect(() => {
    if (galleryCache.has(artist.id)) return;
    let cancelled = false;
    void fetchArtistGalleryPreview(createClient(), artist.id).then((urls) => {
      galleryCache.set(artist.id, urls);
      if (!cancelled) setImages(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [artist.id]);

  return (
    <div
      className={`pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 p-3 ${POPOVER_SURFACE}`}
    >
      <div className="flex items-center gap-3">
        <InitialsAvatar name={artist.name} imageUrl={artist.avatarUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink-black dark:text-ink-cream">
            {artist.name}
          </p>
          {artist.styles.length > 0 ? (
            <p className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-black/40 dark:text-ink-cream/40">
              {artist.styles.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>
      {images === null ? (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-ink-black/[0.05] dark:bg-ink-cream/[0.06]"
            />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {images.slice(0, 6).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`${artist.name} portfolio piece`}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 font-mono text-[10px] text-ink-black/30 dark:text-ink-cream/30">
          No portfolio yet
        </p>
      )}
    </div>
  );
}

function ArtistPill({
  artist,
  active,
  onToggle,
}: {
  artist: BookableRosterArtist;
  active: boolean;
  onToggle: () => void;
}) {
  const [peek, setPeek] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    timer.current = setTimeout(() => setPeek(true), HOVER_DELAY_MS);
  };
  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    setPeek(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const overflow = artist.styles.length - MAX_PILL_STYLES;
  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-pressed={active}
        onClick={onToggle}
        className={`flex min-h-[52px] items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-left transition-colors ${
          active ? PILL_ACTIVE : PILL_IDLE
        }`}
      >
        <InitialsAvatar name={artist.name} imageUrl={artist.avatarUrl} size="md" />
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span
            className={`max-w-[10rem] truncate text-[12px] font-medium leading-none ${
              active ? "" : "text-ink-black/80 dark:text-ink-cream/80"
            }`}
          >
            {artist.name}
          </span>
          {artist.styles.length > 0 ? (
            <span className="flex gap-1">
              {artist.styles.slice(0, MAX_PILL_STYLES).map((s) => (
                <MetaChip key={s} className={active ? ACTIVE_CHIP : undefined}>
                  {s}
                </MetaChip>
              ))}
              {overflow > 0 ? (
                <MetaChip className={active ? ACTIVE_CHIP : undefined}>+{overflow}</MetaChip>
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
      {peek ? <ArtistHoverCard artist={artist} /> : null}
    </div>
  );
}

/** Type-to-filter select for rosters too large for pills. */
function ArtistSearchSelect({
  roster,
  value,
  onChange,
}: {
  roster: BookableRosterArtist[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = roster.find((a) => a.id === value);

  if (selected) {
    return (
      <div className="flex min-h-[44px] items-center gap-3 rounded-xl border border-ink-black/[0.08] px-3 py-2 dark:border-ink-cream/[0.08]">
        <InitialsAvatar name={selected.name} imageUrl={selected.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
            {selected.name}
          </p>
          {selected.styles.length > 0 ? (
            <p className="truncate font-mono text-[9px] uppercase tracking-wide text-ink-black/35 dark:text-ink-cream/35">
              {selected.styles.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="min-h-[44px] px-2 font-mono text-[11px] text-ink-black/40 transition-colors hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
        >
          Change
        </button>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const matches = q
    ? roster.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.styles.some((s) => s.toLowerCase().includes(q))
      )
    : roster;

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="artist-picker-list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={`Search ${roster.length} artists — or leave as any artist`}
        className="min-h-[44px] w-full rounded-xl border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] text-ink-black outline-none transition-colors focus:border-ink-black/25 dark:border-ink-cream/[0.08] dark:text-ink-cream dark:focus:border-ink-cream/25"
      />
      {open ? (
        <div
          id="artist-picker-list"
          role="listbox"
          // Keep input focus so blur doesn't close the list before a row click lands.
          onMouseDown={(e) => e.preventDefault()}
          className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto p-1.5 ${POPOVER_SURFACE}`}
        >
          {matches.length === 0 ? (
            <p className="p-3 font-mono text-[11px] text-ink-black/40 dark:text-ink-cream/40">
              No artists match &quot;{query}&quot;
            </p>
          ) : (
            matches.map((a) => (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={a.id === value}
                onClick={() => {
                  onChange(a.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ink-black/[0.04] dark:hover:bg-ink-cream/[0.06]"
              >
                <InitialsAvatar name={a.name} imageUrl={a.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink-black dark:text-ink-cream">
                    {a.name}
                  </span>
                  {a.styles.length > 0 ? (
                    <span className="block truncate font-mono text-[9px] uppercase tracking-wide text-ink-black/35 dark:text-ink-cream/35">
                      {a.styles.slice(0, 3).join(" · ")}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

interface ArtistPickerProps {
  roster: BookableRosterArtist[];
  /** Selected artist id; "" means "Any artist". */
  value: string;
  onChange: (id: string) => void;
}

/** Roster picker for the studio request form: pills up to 5 artists, searchable select beyond. */
export function ArtistPicker({ roster, value, onChange }: ArtistPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel>Artist</FieldLabel>
        <p className="font-mono text-[10px] text-ink-black/25 dark:text-ink-cream/25">
          Any artist lets the studio match you
        </p>
      </div>
      {roster.length <= PILL_LIMIT ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={value === ""}
            onClick={() => onChange("")}
            className={`min-h-[52px] rounded-full border px-5 font-mono text-[11px] transition-colors ${
              value === "" ? PILL_ACTIVE : PILL_IDLE
            }`}
          >
            Any artist
          </button>
          {roster.map((a) => (
            <ArtistPill
              key={a.id}
              artist={a}
              active={a.id === value}
              onToggle={() => onChange(a.id === value ? "" : a.id)}
            />
          ))}
        </div>
      ) : (
        <ArtistSearchSelect roster={roster} value={value} onChange={onChange} />
      )}
    </div>
  );
}

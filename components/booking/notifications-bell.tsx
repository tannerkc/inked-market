"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { NavPill } from "@/components/ui/nav-pill";
import { cn } from "@/lib/utils";
import { useNotificationsFeed, type NotificationItem } from "./use-notifications-feed";

function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function timestamp(iso: string): string {
  const time = new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${relativeDay(iso)} · ${time}`;
}

const REQUEST_KINDS = new Set(["request_received", "request_accepted", "request_declined"]);
/** Kinds backed by a client conversation — these get a Respond action. */
const RESPOND_KINDS = new Set(["request_received", "request_accepted"]);

type Filter = "all" | "unread" | "requests" | "appointments" | "archived";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "requests", label: "Requests" },
  { key: "appointments", label: "Appts" },
  { key: "archived", label: "Archived" },
];

function matchesFilter(n: NotificationItem, filter: Filter): boolean {
  if (filter === "archived") return n.archived;
  if (n.archived) return false;
  if (filter === "unread") return n.unread;
  if (filter === "requests") return REQUEST_KINDS.has(n.kind);
  if (filter === "appointments") return !REQUEST_KINDS.has(n.kind);
  return true;
}

/** Message with the actor/studio name bolded (legacy rows have no actorName). */
function ItemMessage({ message, name }: { message: string; name?: string }) {
  const at = name ? message.indexOf(name) : -1;
  if (!name || at < 0) return <>{message}</>;
  return (
    <>
      {message.slice(0, at)}
      <strong className="font-semibold text-ink-black dark:text-ink-cream">{name}</strong>
      {message.slice(at + name.length)}
    </>
  );
}

const actionClass =
  "rounded-md px-1.5 py-1 font-mono text-[9px] uppercase tracking-wide text-ink-black/40 transition-colors hover:bg-ink-black/[0.05] hover:text-ink-black dark:text-ink-cream/40 dark:hover:bg-ink-cream/[0.07] dark:hover:text-ink-cream";

/** Dashboard notification bell — booking events land here. */
export function NotificationsBell() {
  const { items, unreadCount, setRead, setArchived, markAllRead } = useNotificationsFeed();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [oldestFirst, setOldestFirst] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items
    .filter((n) => matchesFilter(n, filter))
    .sort((a, b) =>
      oldestFirst
        ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
        : Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <NavPill className="rounded-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-black/50 transition-colors hover:text-ink-black dark:text-ink-cream/50 dark:hover:text-ink-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-red px-1 font-mono text-[9px] text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </NavPill>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-[14px] border border-ink-black/[0.08] bg-white p-3 shadow-lg dark:border-ink-cream/[0.08] dark:bg-ink-black">
          <div className="flex items-baseline justify-between">
            <GroupLabel>Notifications</GroupLabel>
            {unreadCount > 0 ? (
              <button type="button" onClick={() => void markAllRead()} className={cn(actionClass, "-mt-1")}>
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="mb-2 flex items-center gap-1">
            <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-wide transition-colors",
                    filter === f.key
                      ? "bg-ink-black text-white dark:bg-ink-cream dark:text-ink-black"
                      : "text-ink-black/40 hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOldestFirst((v) => !v)}
              aria-label={`Sorted ${oldestFirst ? "oldest" : "newest"} first — toggle`}
              className={cn(actionClass, "shrink-0")}
            >
              {oldestFirst ? "Oldest ↑" : "Newest ↓"}
            </button>
          </div>

          {visible.length === 0 ? (
            <EmptyState message="Nothing here" variant="subtle" />
          ) : (
            <ul className="flex max-h-80 flex-col overflow-y-auto">
              {visible.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-2 border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]"
                >
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      n.unread ? "bg-ink-red" : "bg-transparent"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[12px] leading-snug",
                        n.unread
                          ? "text-ink-black dark:text-ink-cream"
                          : "text-ink-black/70 dark:text-ink-cream/70"
                      )}
                    >
                      <ItemMessage message={n.message} name={n.actorName} />
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
                      {timestamp(n.createdAt)}
                    </p>
                    <div className="mt-1 -ml-1.5 flex items-center">
                      {RESPOND_KINDS.has(n.kind) && !n.archived ? (
                        <Link
                          href="/messages"
                          onClick={() => setOpen(false)}
                          className={cn(actionClass, "text-ink-red/70 hover:text-ink-red dark:text-ink-red/70 dark:hover:text-ink-red")}
                        >
                          Respond
                        </Link>
                      ) : null}
                      <button type="button" onClick={() => void setRead(n.id, n.unread)} className={actionClass}>
                        {n.unread ? "Mark read" : "Mark unread"}
                      </button>
                      <button type="button" onClick={() => void setArchived(n.id, !n.archived)} className={actionClass}>
                        {n.archived ? "Restore" : "Archive"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

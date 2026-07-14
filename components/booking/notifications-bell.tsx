"use client";

import { useState } from "react";
import { useNotificationsFeed } from "./use-notifications-feed";

function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/** Dashboard notification bell — booking events land here. */
export function NotificationsBell() {
  const { items, unreadCount, markAllRead } = useNotificationsFeed();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) void markAllRead();
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-ink-black/[0.08] text-ink-black/50 transition-colors hover:text-ink-black dark:border-ink-cream/[0.08] dark:text-ink-cream/50 dark:hover:text-ink-cream"
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

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-[14px] border border-ink-black/[0.08] bg-white p-3 shadow-lg dark:border-ink-cream/[0.08] dark:bg-ink-black">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/35 dark:text-ink-cream/35">
            Notifications
          </p>
          {items.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-ink-black/40 dark:text-ink-cream/40">
              Nothing yet
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="border-b border-ink-black/[0.04] py-2 last:border-0 dark:border-ink-cream/[0.04]"
                >
                  <p className="text-[12px] leading-snug text-ink-black/80 dark:text-ink-cream/80">
                    {n.message}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
                    {relativeDay(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

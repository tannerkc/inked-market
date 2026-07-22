"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavPill } from "@/components/ui/nav-pill";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

/** Fired by the messages hub whenever a thread is marked read. */
export const MESSAGES_READ_EVENT = "inked:messages-read";

/**
 * Nav-pill entry to /messages with a live unread badge (count of conversations
 * holding unread messages — RLS scopes the query to the caller's threads).
 */
const MessagesNavButton = () => {
  const pathname = usePathname();
  // Auth comes from the provider — never supabase.auth.getUser() in browser
  // components (concurrent calls contend for the auth navigator lock).
  const { user } = useAuth();
  const userId = user?.id;
  const supabaseRef = React.useRef(createClient());
  const [unread, setUnread] = React.useState(0);

  const fetchUnread = React.useCallback(async (): Promise<number | null> => {
    if (!userId) return null;
    const { data } = await supabaseRef.current
      .from("messages")
      .select("conversation_id")
      .eq("read", false)
      .neq("sender_id", userId)
      .limit(500);
    return new Set((data ?? []).map((r) => r.conversation_id as string)).size;
  }, [userId]);

  React.useEffect(() => {
    let cancelled = false;
    const apply = () =>
      void fetchUnread().then((n) => {
        if (!cancelled && n !== null) setUnread(n);
      });
    apply();
    const interval = setInterval(() => {
      if (!document.hidden) apply();
    }, POLL_MS);
    const onSignal = () => {
      if (!document.hidden) apply();
    };
    document.addEventListener("visibilitychange", onSignal);
    window.addEventListener(MESSAGES_READ_EVENT, onSignal);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onSignal);
      window.removeEventListener(MESSAGES_READ_EVENT, onSignal);
    };
  }, [fetchUnread]);

  const active = pathname === "/messages";

  return (
    <NavPill className="rounded-full">
      <Link
        href="/messages"
        aria-label={`Messages${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          active
            ? "text-ink-black dark:text-ink-cream"
            : "text-ink-black/50 hover:text-ink-black dark:text-ink-cream/50 dark:hover:text-ink-cream"
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-red px-1 font-mono text-[9px] text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
    </NavPill>
  );
};
MessagesNavButton.displayName = "MessagesNavButton";

export { MessagesNavButton };

"use client";

import * as React from "react";
import Link from "next/link";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { InboxConversation, MessagePartner } from "@/lib/types/messaging";
import { DRAFT_ID } from "./use-messages";

interface ConversationListProps {
  /** null while the first load is in flight. */
  conversations: InboxConversation[] | null;
  activeId: string | null;
  /** Pinned not-yet-created thread from a ?to= deep link. */
  draftPartner: MessagePartner | null;
  onSelect: (id: string) => void;
}

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-3 py-3">
      <span className="h-8 w-8 shrink-0 rounded-full bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
      <span className="flex-1 space-y-2">
        <span className="block h-2.5 w-1/3 rounded bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
        <span className="block h-2 w-2/3 rounded bg-ink-black/[0.04] dark:bg-ink-cream/[0.04]" />
      </span>
    </div>
  );
}

function ConversationRow({
  active,
  unread,
  partner,
  title,
  preview,
  when,
  onClick,
}: {
  active: boolean;
  unread: number;
  partner: MessagePartner;
  title: string;
  preview: string;
  when?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active || undefined}
      className={cn(
        "relative flex w-full min-h-[44px] items-center gap-3 px-3 py-3 text-left transition-colors",
        active
          ? "bg-ink-black/[0.05] dark:bg-ink-cream/[0.06]"
          : "hover:bg-ink-black/[0.03] dark:hover:bg-ink-cream/[0.03]"
      )}
    >
      {active ? <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-ink-red" /> : null}
      <InitialsAvatar
        name={partner.name}
        imageUrl={partner.avatarUrl}
        size="md"
        shape={partner.role === "studio" ? "rounded" : "circle"}
        tone={unread > 0 ? "accent" : "muted"}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[12px] text-ink-black dark:text-ink-cream",
              unread > 0 ? "font-semibold" : "font-medium"
            )}
          >
            {title}
          </span>
          {when ? <span className="shrink-0 font-mono text-[9px] text-ink-black/25 dark:text-ink-cream/25">
              {when}
            </span> : null}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "flex-1 truncate text-[11px]",
              unread > 0
                ? "text-ink-black/60 dark:text-ink-cream/60"
                : "text-ink-black/40 dark:text-ink-cream/40"
            )}
          >
            {preview}
          </span>
          {unread > 0 ? <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-ink-red px-1 font-mono text-[9px] text-white">
              {unread > 99 ? "99+" : unread}
            </span> : null}
        </span>
      </span>
    </button>
  );
}

const ConversationList = ({
  conversations,
  activeId,
  draftPartner,
  onSelect,
}: ConversationListProps) => {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    if (!conversations) return null;
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.partner.name.toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <>
      <div className="shrink-0 border-b border-ink-black/[0.06] p-3 dark:border-ink-cream/[0.06]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          className="w-full rounded-full border border-ink-black/10 bg-transparent px-3.5 py-2 text-[12px] text-ink-black outline-none transition-colors placeholder:font-mono placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.15em] placeholder:text-ink-black/30 focus:border-ink-black/30 dark:border-ink-cream/15 dark:text-ink-cream dark:placeholder:text-ink-cream/30 dark:focus:border-ink-cream/35"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {draftPartner ? <ConversationRow
            active={activeId === DRAFT_ID}
            unread={0}
            partner={draftPartner}
            title={draftPartner.name}
            preview="New conversation"
            onClick={() => onSelect(DRAFT_ID)}
          /> : null}

        {filtered === null ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : filtered.length === 0 && !draftPartner ? (
          query ? (
            <p className="px-4 py-8 text-center text-[12px] text-ink-black/50 dark:text-ink-cream/50">
              No conversations match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/30 dark:text-ink-cream/30">
                Inbox empty
              </p>
              <p className="max-w-[220px] text-[12px] leading-relaxed text-ink-black/60 dark:text-ink-cream/60">
                Reach out to an artist or studio and the conversation lands here.
              </p>
              <Button variant="ink-outline" size="sm" as={Link} href="/discover" className="mt-1">
                Find artists
              </Button>
            </div>
          )
        ) : (
          filtered.map((c) => (
            <ConversationRow
              key={c.id}
              active={activeId === c.id}
              unread={c.unread}
              partner={c.partner}
              title={c.partner.name}
              preview={c.lastMessage ?? "Say hello"}
              when={formatRelativeTime(new Date(c.lastMessageAt))}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </>
  );
};
ConversationList.displayName = "ConversationList";

export { ConversationList, ConversationRow, RowSkeleton as ConversationRowSkeleton };
export type { ConversationListProps };

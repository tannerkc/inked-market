"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListGroup } from "@/components/dashboard/list-group";
import { ConversationRow, ConversationRowSkeleton } from "@/components/messages";
import { fetchInbox } from "@/app/messages/actions";
import { formatRelativeTime } from "@/lib/utils";
import type { InboxConversation } from "@/lib/types/messaging";

interface MessagesCardProps {
  /** Provide to render from parent data (null = loading); omit to self-fetch. */
  conversations?: InboxConversation[] | null;
  limit?: number;
  emptyDescription?: string;
  className?: string;
}

/**
 * Dashboard spoke into the /messages hub: recent threads with unread emphasis,
 * rows and "View all" deep-link into the hub. Never a second messenger.
 */
const MessagesCard = ({
  conversations,
  limit = 4,
  emptyDescription = "Client messages land here",
  className,
}: MessagesCardProps) => {
  const router = useRouter();
  const selfFetch = conversations === undefined;
  const [fetched, setFetched] = React.useState<InboxConversation[] | null>(null);

  React.useEffect(() => {
    if (!selfFetch) return;
    let cancelled = false;
    void fetchInbox().then((res) => {
      if (!cancelled) setFetched(res.ok ? res.conversations : []);
    });
    return () => {
      cancelled = true;
    };
  }, [selfFetch]);

  const list = selfFetch ? fetched : conversations;

  return (
    <DashboardSection
      title="Messages"
      action={{ label: "View all", onClick: () => router.push("/messages") }}
      className={className}
    >
      {list == null ? (
        <ListGroup>
          <ConversationRowSkeleton />
          <ConversationRowSkeleton />
          <ConversationRowSkeleton />
        </ListGroup>
      ) : list.length === 0 ? (
        <EmptyState message="No conversations yet" description={emptyDescription} />
      ) : (
        <ListGroup>
          {list.slice(0, limit).map((c) => (
            <ConversationRow
              key={c.id}
              active={false}
              unread={c.unread}
              partner={c.partner}
              title={c.partner.name}
              preview={c.lastMessage ?? "Say hello"}
              when={formatRelativeTime(new Date(c.lastMessageAt))}
              onClick={() => router.push(`/messages?c=${c.id}`)}
            />
          ))}
        </ListGroup>
      )}
    </DashboardSection>
  );
};
MessagesCard.displayName = "MessagesCard";

export { MessagesCard };
export type { MessagesCardProps };

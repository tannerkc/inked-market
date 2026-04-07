"use client";

import * as React from "react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import type { Conversation, ConversationParticipant } from "@/lib/types";

interface CustomerMessagesSectionProps {
  conversations: Conversation[];
  participants: Record<string, ConversationParticipant>;
  currentUserId: string;
  className?: string;
}

const CustomerMessagesSection = React.forwardRef<
  HTMLDivElement,
  CustomerMessagesSectionProps
>(({ conversations, participants, currentUserId, className, ...props }, ref) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div ref={ref} className={className} {...props}>
      <DashboardSection title="Messages">
        {conversations.length === 0 ? (
          <EmptyState
            message="No conversations yet"
            description="Start by reaching out to an artist"
          />
        ) : (
          <div>
            {conversations.map((convo) => {
              const otherParticipantId = convo.participantIds.find(
                (id) => id !== currentUserId
              );
              const participant = otherParticipantId
                ? participants[otherParticipantId]
                : undefined;
              const name = participant?.name ?? "Unknown";
              const avatarUrl = participant?.avatarUrl;
              const isStudio = participant?.role === "studio";
              const unread = convo.unreadCount[currentUserId] ?? 0;

              return (
                <div
                  key={convo.id}
                  className={cn(
                    "flex items-center gap-3 py-3 border-b transition-colors",
                    isDark
                      ? "border-ink-cream/[0.04] hover:bg-ink-cream/[0.04]"
                      : "border-ink-black/[0.04] hover:bg-ink-black/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden",
                      isStudio ? "rounded-lg" : "rounded-full",
                      avatarUrl
                        ? ""
                        : cn(
                            isDark
                              ? "bg-ink-cream/[0.06]"
                              : "bg-ink-black/[0.06]"
                          )
                    )}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-[10px] font-medium select-none",
                          isDark ? "text-ink-cream/40" : "text-ink-black/40"
                        )}
                      >
                        {getInitials(name)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[12px] font-semibold truncate",
                        isDark ? "text-ink-cream" : "text-ink-black"
                      )}
                    >
                      {name}
                    </p>
                    {convo.lastMessage && (
                      <p
                        className={cn(
                          "text-[11px] truncate",
                          isDark ? "text-ink-cream/40" : "text-ink-black/40"
                        )}
                      >
                        {convo.lastMessage}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-[10px] mt-0.5",
                        isDark ? "text-ink-cream/25" : "text-ink-black/25"
                      )}
                    >
                      {formatRelativeTime(convo.lastMessageAt)}
                    </p>
                  </div>

                  {unread > 0 && (
                    <div className="flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-ink-red" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
});
CustomerMessagesSection.displayName = "CustomerMessagesSection";

export { CustomerMessagesSection };
export type { CustomerMessagesSectionProps };

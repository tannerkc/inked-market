"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { TattooPenIcon } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { MessageComposer } from "./message-composer";
import { useMessages } from "./use-messages";

interface MessagesShellProps {
  /** ?c= deep link (notification bell, dashboard rows). */
  initialConversationId?: string;
  /** ?to= deep link ("artist:<id>", "studio:<id>", or a user id). */
  initialTo?: string;
}

const FRAME_CLASS =
  "flex h-[calc(100dvh-14rem)] max-h-[860px] min-h-[440px] overflow-hidden rounded-[18px] border border-ink-black/[0.08] bg-white shadow-sm dark:border-ink-cream/[0.08] dark:bg-ink-black-raised";

function GhostPane({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <TattooPenIcon className="h-8 w-8 text-ink-black/15 dark:text-ink-cream/15" />
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-black/30 dark:text-ink-cream/30">
        {label}
      </p>
      {hint ? (
        <p className="max-w-[260px] text-[12px] leading-relaxed text-ink-black/50 dark:text-ink-cream/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SignedOutCard() {
  return (
    <div className={cn(FRAME_CLASS, "items-center justify-center")}>
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <TattooPenIcon className="h-9 w-9 text-ink-black/20 dark:text-ink-cream/20" />
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-black/35 dark:text-ink-cream/35">
          Members only
        </p>
        <p className="max-w-[300px] text-[13px] leading-relaxed text-ink-black/60 dark:text-ink-cream/60">
          Sign in to message artists and studios — quotes, ideas, and booking
          details all live here.
        </p>
        <Button variant="ink-red" size="sm" as={Link} href="/login" className="mt-1">
          Sign in
        </Button>
        <Link
          href="/signup"
          className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-black/35 transition-colors hover:text-ink-black dark:text-ink-cream/35 dark:hover:text-ink-cream"
        >
          New here? Create an account
        </Link>
      </div>
    </div>
  );
}

const MessagesShell = ({ initialConversationId, initialTo }: MessagesShellProps) => {
  const { user, isAuthenticated, hydrated } = useAuth();
  const {
    conversations,
    activeId,
    activeConversation,
    activePartner,
    activeThread,
    activeNotFound,
    isDraft,
    notice,
    dismissNotice,
    select,
    send,
    retry,
    discard,
    loadOlder,
  } = useMessages(
    hydrated && isAuthenticated ? user?.id : undefined,
    initialConversationId,
    initialTo
  );

  if (hydrated && !isAuthenticated) return <SignedOutCard />;

  const threadOpen = activeId !== null;

  return (
    <>
      {notice ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-[14px] border border-ink-red/25 bg-ink-red/[0.06] px-4 py-2.5">
          <p className="text-[12px] text-ink-black dark:text-ink-cream">{notice}</p>
          <button
            type="button"
            onClick={dismissNotice}
            className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-ink-black/40 transition-colors hover:text-ink-black dark:text-ink-cream/40 dark:hover:text-ink-cream"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className={FRAME_CLASS}>
        {/* ── Conversation list ── */}
        <aside
          className={cn(
            "w-full flex-col md:flex md:w-[320px] md:shrink-0 md:border-r md:border-ink-black/[0.06] dark:md:border-ink-cream/[0.06]",
            threadOpen ? "hidden" : "flex"
          )}
        >
          <ConversationList
            conversations={hydrated ? conversations : null}
            activeId={activeId}
            draftPartner={isDraft ? activePartner : null}
            onSelect={select}
          />
        </aside>

        {/* ── Thread ── */}
        <section
          className={cn("min-w-0 flex-1 flex-col", threadOpen ? "flex" : "hidden md:flex")}
        >
          {threadOpen && activePartner && activeThread && user ? (
            <MessageThread
              key={activeId}
              partner={activePartner}
              thread={activeThread}
              meId={user.id}
              isDraft={isDraft}
              booking={activeConversation?.booking ?? null}
              onLoadOlder={() => void loadOlder()}
              onRetry={(m) => void retry(m)}
              onDiscard={discard}
              onBack={() => select(null)}
              composer={<MessageComposer userId={user.id} onSend={send} />}
            />
          ) : threadOpen && activeNotFound ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-black/30 dark:text-ink-cream/30">
                Conversation not found
              </p>
              <p className="max-w-[280px] text-[12px] leading-relaxed text-ink-black/50 dark:text-ink-cream/50">
                That thread doesn&apos;t exist or isn&apos;t yours to read.
              </p>
              <Button variant="ink-outline" size="sm" onClick={() => select(null)}>
                Back to inbox
              </Button>
            </div>
          ) : threadOpen ? (
            <GhostPane label="Loading" />
          ) : (
            <GhostPane
              label="Select a conversation"
              hint="Pick a thread from the left, or message an artist from their profile."
            />
          )}
        </section>
      </div>
    </>
  );
};
MessagesShell.displayName = "MessagesShell";

export { MessagesShell };
export type { MessagesShellProps };

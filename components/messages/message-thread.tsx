"use client";

import * as React from "react";
import Link from "next/link";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { PhotoLightbox, type LightboxPhoto } from "@/components/ui/photo-lightbox";
import { cn } from "@/lib/utils";
import type { MessagePartner, ThreadMessage } from "@/lib/types/messaging";
import type { ThreadState } from "./use-messages";

interface MessageThreadProps {
  partner: MessagePartner;
  thread: ThreadState;
  meId: string;
  isDraft: boolean;
  /** Latest booking request linked to this thread, if any. */
  booking?: { status: string } | null;
  onLoadOlder: () => void;
  onRetry: (message: ThreadMessage) => void;
  onDiscard: (message: ThreadMessage) => void;
  /** Mobile: return to the conversation list. */
  onBack: () => void;
  composer: React.ReactNode;
}

const GROUP_GAP_MS = 5 * 60_000;

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const ROLE_LABEL: Record<MessagePartner["role"], string> = {
  artist: "Artist",
  studio: "Studio",
  customer: "Client",
};

const microActionClass =
  "font-mono text-[9px] uppercase tracking-wide transition-colors cursor-pointer";

function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3 first:mt-0" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/30 dark:text-ink-cream/30">
        {label}
      </span>
      <span className="h-px flex-1 bg-ink-black/[0.06] dark:bg-ink-cream/[0.06]" />
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4">
      {[64, 40, 56, 32].map((w, i) => (
        <div key={i} className={cn("flex animate-pulse", i % 2 ? "justify-end" : "justify-start")}>
          <span
            className="h-9 rounded-[16px] bg-ink-black/[0.05] dark:bg-ink-cream/[0.05]"
            style={{ width: `${w}%` }}
          />
        </div>
      ))}
    </div>
  );
}

const STATUS_ACCENT: Record<string, string> = {
  pending: "text-ink-rust",
  accepted: "text-ink-sage",
};

const MessageThread = ({
  partner,
  thread,
  meId,
  isDraft,
  booking,
  onLoadOlder,
  onRetry,
  onDiscard,
  onBack,
  composer,
}: MessageThreadProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const nearBottomRef = React.useRef(true);
  const prevCountRef = React.useRef(0);
  const prevFirstIdRef = React.useRef<string | null>(null);
  const prevHeightRef = React.useRef(0);
  const [showJump, setShowJump] = React.useState(false);
  const [lightbox, setLightbox] = React.useState<{
    photos: LightboxPhoto[];
    index: number;
  } | null>(null);

  const { messages, loaded, hasMore, loadingOlder } = thread;

  const scrollToBottom = React.useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setShowJump(false);
  }, []);

  // Stick to the bottom for new messages, preserve position when older pages
  // prepend, and surface a jump pill when new messages arrive while scrolled up.
  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = messages[0]?.id ?? null;
    const prepended =
      prevFirstIdRef.current !== null && first !== prevFirstIdRef.current &&
      messages.length > prevCountRef.current;

    if (prevCountRef.current === 0 && messages.length > 0) {
      el.scrollTop = el.scrollHeight;
    } else if (prepended) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
    } else if (messages.length > prevCountRef.current) {
      const last = messages[messages.length - 1];
      if (last?.senderId === meId || nearBottomRef.current) scrollToBottom(true);
      else setShowJump(true);
    }
    prevCountRef.current = messages.length;
    prevFirstIdRef.current = first;
  }, [messages, meId, scrollToBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottomRef.current) setShowJump(false);
    if (el.scrollTop < 60 && hasMore && !loadingOlder) {
      prevHeightRef.current = el.scrollHeight;
      onLoadOlder();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const openLightbox = (attachments: string[], index: number) =>
    setLightbox({ photos: attachments.map((src, id) => ({ id, src, alt: "Attachment" })), index });

  return (
    <>
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-ink-black/[0.06] px-3 py-3 dark:border-ink-cream/[0.06] sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-black/50 transition-colors hover:bg-ink-black/[0.05] hover:text-ink-black dark:text-ink-cream/50 dark:hover:bg-ink-cream/[0.07] dark:hover:text-ink-cream md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <InitialsAvatar
          name={partner.name}
          imageUrl={partner.avatarUrl}
          size="md"
          shape={partner.role === "studio" ? "rounded" : "circle"}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink-black dark:text-ink-cream">
            {partner.name}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-black/35 dark:text-ink-cream/35">
            {ROLE_LABEL[partner.role]}
          </p>
        </div>
        {partner.profileHref ? (
          <Link
            href={partner.profileHref}
            className={cn(
              microActionClass,
              "shrink-0 rounded-md px-2 py-1.5 text-ink-black/40 hover:bg-ink-black/[0.05] hover:text-ink-black dark:text-ink-cream/40 dark:hover:bg-ink-cream/[0.07] dark:hover:text-ink-cream"
            )}
          >
            View profile
          </Link>
        ) : null}
      </header>

      {/* ── Booking context strip ── */}
      {booking ? (
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center justify-between gap-2 border-b border-ink-black/[0.06] bg-ink-black/[0.02] px-4 py-2 transition-colors hover:bg-ink-black/[0.04] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.03] dark:hover:bg-ink-cream/[0.05]"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-black/45 dark:text-ink-cream/45">
            Booking request ·{" "}
            <span className={STATUS_ACCENT[booking.status] ?? ""}>{booking.status}</span>
          </span>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-rust">
            View →
          </span>
        </Link>
      ) : null}

      {/* ── Messages ── */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          aria-live="polite"
          className="h-full overflow-y-auto px-3 py-4 sm:px-4"
        >
          {loadingOlder ? (
            <p className="pb-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/30 dark:text-ink-cream/30">
              Loading earlier messages…
            </p>
          ) : null}

          {!loaded && !isDraft ? (
            <ThreadSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <InitialsAvatar
                name={partner.name}
                imageUrl={partner.avatarUrl}
                size="lg"
                shape={partner.role === "studio" ? "rounded" : "circle"}
              />
              <p className="mt-2 text-[13px] font-semibold text-ink-black dark:text-ink-cream">
                {partner.name}
              </p>
              <p className="max-w-[260px] text-[12px] leading-relaxed text-ink-black/50 dark:text-ink-cream/50">
                {isDraft
                  ? "This is the start of your conversation. Introduce yourself and your idea."
                  : "No messages yet — break the ice."}
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const mine = m.senderId === meId;
              const newDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt);
              const groupEnd =
                !next ||
                next.senderId !== m.senderId ||
                Date.parse(next.createdAt) - Date.parse(m.createdAt) > GROUP_GAP_MS ||
                dayLabel(next.createdAt) !== dayLabel(m.createdAt);
              const isLast = m.id === lastMessage?.id;

              return (
                <React.Fragment key={m.id}>
                  {newDay ? <DaySeparator label={dayLabel(m.createdAt)} /> : null}
                  <div
                    className={cn(
                      "flex",
                      mine ? "justify-end" : "justify-start",
                      newDay || (prev && prev.senderId !== m.senderId) ? "mt-2" : "mt-1"
                    )}
                  >
                    <div className={cn("max-w-[85%] sm:max-w-[70%]", mine && "items-end")}>
                      <div
                        className={cn(
                          "overflow-hidden rounded-[16px] text-[13px] leading-relaxed",
                          mine
                            ? "bg-ink-black text-ink-cream dark:bg-ink-cream dark:text-ink-black"
                            : "bg-ink-black/[0.05] text-ink-black dark:bg-ink-cream/[0.08] dark:text-ink-cream",
                          groupEnd && (mine ? "rounded-br-[5px]" : "rounded-bl-[5px]"),
                          m.status === "sending" && "opacity-60",
                          m.status === "failed" && "opacity-60 saturate-0"
                        )}
                      >
                        {m.attachments.length > 0 ? (
                          <div className={cn("flex flex-wrap gap-0.5 p-1", m.content && "pb-0")}>
                            {m.attachments.map((url, idx) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() => openLightbox(m.attachments, idx)}
                                aria-label="View attachment"
                                className="cursor-zoom-in overflow-hidden rounded-[12px]"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt="Attachment"
                                  loading="lazy"
                                  className="h-36 w-36 object-cover sm:h-44 sm:w-44"
                                />
                              </button>
                            ))}
                          </div>
                        ) : null}
                        {m.content ? (
                          <p className="whitespace-pre-wrap break-words px-3.5 py-2">{m.content}</p>
                        ) : null}
                      </div>

                      {m.status === "failed" ? (
                        <div className={cn("mt-1 flex items-center gap-2.5", mine && "justify-end")}>
                          <span className="font-mono text-[9px] uppercase tracking-wide text-ink-red">
                            Not sent
                          </span>
                          <button
                            type="button"
                            onClick={() => onRetry(m)}
                            className={cn(microActionClass, "text-ink-black/60 underline dark:text-ink-cream/60")}
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => onDiscard(m)}
                            className={cn(microActionClass, "text-ink-black/35 dark:text-ink-cream/35")}
                          >
                            Discard
                          </button>
                        </div>
                      ) : groupEnd ? (
                        <p
                          className={cn(
                            "mt-1 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30",
                            mine && "text-right"
                          )}
                        >
                          {m.status === "sending"
                            ? "Sending…"
                            : `${timeLabel(m.createdAt)}${
                                isLast && mine ? (m.read ? " · Seen" : " · Delivered") : ""
                              }`}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {showJump ? (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-black px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-cream shadow-lg transition-transform hover:scale-105 dark:bg-ink-cream dark:text-ink-black"
          >
            New message ↓
          </button>
        ) : null}
      </div>

      {composer}

      {lightbox ? (
        <PhotoLightbox
          photos={lightbox.photos}
          activeIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox((s) => (s ? { ...s, index } : s))}
        />
      ) : null}
    </>
  );
};
MessageThread.displayName = "MessageThread";

export { MessageThread };
export type { MessageThreadProps };

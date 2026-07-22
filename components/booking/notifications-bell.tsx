"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getBookingRequestForResponse,
  getOwnBookingRequest,
  respondToBookingRequest,
} from "@/app/book/actions";
import { sendMessage } from "@/app/messages/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GroupLabel } from "@/components/dashboard/group-label";
import { Button } from "@/components/ui/button";
import { MetaChip } from "@/components/ui/meta-chip";
import { NavPill } from "@/components/ui/nav-pill";
import { notificationContextLabel } from "@/lib/booking/notify";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { BookingRequestRecord } from "@/lib/types/booking";
import { cn } from "@/lib/utils";
import type { RespondToRequestInput } from "@/lib/validation/schemas";
import { CustomerRequestPanel } from "./customer-request-panel";
import { RequestDetailPanel } from "./request-detail-panel";
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

/** Kind → nav quick actions. Messages and requests get inline handling instead. */
const NAV_ACTIONS: Record<string, { label: string; href: string }[]> = {
  request_declined: [
    { label: "View note", href: "/messages" },
    { label: "Browse artists", href: "/discover" },
  ],
  appointment_booked: [{ label: "View schedule", href: "/dashboard" }],
  appointment_cancelled: [{ label: "View schedule", href: "/dashboard" }],
  deposit_paid: [{ label: "View appointment", href: "/dashboard" }],
};

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
  if (filter === "appointments")
    return !REQUEST_KINDS.has(n.kind) && n.kind !== "message_received";
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

const redActionClass =
  "text-ink-red/70 hover:text-ink-red dark:text-ink-red/70 dark:hover:text-ink-red";

interface ReplyDraft {
  id: string;
  text: string;
  sending: boolean;
  error: string | null;
}

interface PeekState {
  id: string;
  loading: boolean;
  error: string | null;
  request: BookingRequestRecord | null;
}

/** Dashboard notification bell — booking events land here. */
export function NotificationsBell() {
  const { items, unreadCount, setRead, setArchived, markAllRead } = useNotificationsFeed();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [oldestFirst, setOldestFirst] = useState(false);
  const [reply, setReply] = useState<ReplyDraft | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [peek, setPeek] = useState<PeekState | null>(null);
  const [detail, setDetail] = useState<{
    request: BookingRequestRecord;
    mode: "accept" | "decline";
  } | null>(null);
  const [pickLoading, setPickLoading] = useState<string | null>(null);
  const [pickError, setPickError] = useState<{ id: string; message: string } | null>(null);
  const [customerPanel, setCustomerPanel] = useState<{
    request: BookingRequestRecord;
    scheduled: boolean;
    sessionCount: number;
  } | null>(null);
  const [responding, setResponding] = useState(false);
  const [respondError, setRespondError] = useState<string | null>(null);
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

  const markRead = (n: NotificationItem) => {
    if (n.unread) void setRead(n.id, true);
  };

  /** Nav quick actions mark read and dismiss the popover on the way out. */
  const navClick = (n: NotificationItem) => {
    markRead(n);
    setOpen(false);
  };

  const toggleReply = (n: NotificationItem) => {
    setReply((cur) => (cur?.id === n.id ? null : { id: n.id, text: "", sending: false, error: null }));
  };

  const sendReply = async (n: NotificationItem) => {
    if (!reply || reply.id !== n.id || !n.actorUserId) return;
    const content = reply.text.trim();
    if (!content || reply.sending) return;
    setReply({ ...reply, sending: true, error: null });
    const res = await sendMessage({ toUserId: n.actorUserId, content });
    if (res.ok) {
      setSent((s) => ({ ...s, [n.id]: true }));
      setReply(null);
      markRead(n);
    } else {
      setReply((cur) =>
        cur?.id === n.id ? { ...cur, sending: false, error: res.error } : cur
      );
    }
  };

  const togglePeek = async (n: NotificationItem) => {
    if (peek?.id === n.id) {
      setPeek(null);
      return;
    }
    if (!n.requestId) return;
    markRead(n);
    setPeek({ id: n.id, loading: true, error: null, request: null });
    const res = await getBookingRequestForResponse(n.requestId);
    setPeek((cur) =>
      cur?.id === n.id
        ? {
            id: n.id,
            loading: false,
            error: res.success ? null : (res.error ?? "Couldn't load the request."),
            request: res.request ?? null,
          }
        : cur
    );
  };

  /** Customer side of a request notification: open scheduling without leaving the page. */
  const openPickTime = async (n: NotificationItem) => {
    if (!n.requestId || pickLoading) return;
    markRead(n);
    setPickError(null);
    setPickLoading(n.id);
    const res = await getOwnBookingRequest(n.requestId);
    setPickLoading(null);
    if (res.success && res.request) {
      setCustomerPanel({
        request: res.request,
        scheduled: res.scheduled ?? false,
        sessionCount: res.sessionCount ?? 0,
      });
      setOpen(false);
    } else {
      setPickError({ id: n.id, message: res.error ?? "Couldn't load the request." });
    }
  };

  const openDetail = (request: BookingRequestRecord, mode: "accept" | "decline") => {
    setRespondError(null);
    setDetail({ request, mode });
    setOpen(false);
  };

  const closeDetail = () => {
    setDetail(null);
    setOpen(true);
  };

  const respond = async (input: RespondToRequestInput) => {
    setResponding(true);
    setRespondError(null);
    const result = await respondToBookingRequest(input);
    setResponding(false);
    if (!result.success) {
      setRespondError(result.error ?? "Something went wrong.");
      return false;
    }
    setDetail(null);
    setPeek(null);
    setOpen(true);
    return true;
  };

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
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] text-ink-black/30 dark:text-ink-cream/30">
                      {n.recipientContext ? (
                        <span className="font-semibold uppercase tracking-wide text-ink-black/60 dark:text-ink-cream/55">
                          {notificationContextLabel(n.recipientContext)}
                        </span>
                      ) : null}
                      {n.recipientContext ? <span aria-hidden="true">·</span> : null}
                      <span>{timestamp(n.createdAt)}</span>
                    </p>

                    <div className="mt-1 -ml-1.5 flex flex-wrap items-center">
                      {!n.archived ? (
                        <>
                          {n.kind === "message_received" ? (
                            sent[n.id] ? (
                              <span className="px-1.5 py-1 font-mono text-[9px] uppercase tracking-wide text-ink-sage">
                                Sent ✓
                              </span>
                            ) : n.actorUserId ? (
                              <button
                                type="button"
                                onClick={() => toggleReply(n)}
                                className={cn(actionClass, redActionClass)}
                              >
                                Reply
                              </button>
                            ) : null
                          ) : null}
                          {n.kind === "message_received" ? (
                            <Link href="/messages" onClick={() => navClick(n)} className={actionClass}>
                              Thread
                            </Link>
                          ) : null}

                          {n.kind === "request_received" ? (
                            n.requestId ? (
                              <button
                                type="button"
                                onClick={() => void togglePeek(n)}
                                className={cn(actionClass, redActionClass)}
                              >
                                {peek?.id === n.id ? "Hide request" : "View request"}
                              </button>
                            ) : (
                              <Link
                                href="/dashboard"
                                onClick={() => navClick(n)}
                                className={cn(actionClass, redActionClass)}
                              >
                                View request
                              </Link>
                            )
                          ) : null}

                          {n.kind === "request_accepted" ? (
                            n.requestId ? (
                              <button
                                type="button"
                                onClick={() => void openPickTime(n)}
                                className={cn(actionClass, redActionClass)}
                              >
                                {pickLoading === n.id ? "Loading…" : "Pick a time"}
                              </button>
                            ) : (
                              <Link
                                href="/dashboard"
                                onClick={() => navClick(n)}
                                className={cn(actionClass, redActionClass)}
                              >
                                Pick a time
                              </Link>
                            )
                          ) : null}

                          {(NAV_ACTIONS[n.kind] ?? []).map((a, i) => (
                            <Link
                              key={a.label}
                              href={a.href}
                              onClick={() => navClick(n)}
                              className={cn(actionClass, i === 0 ? redActionClass : undefined)}
                            >
                              {a.label}
                            </Link>
                          ))}
                        </>
                      ) : null}
                      <button type="button" onClick={() => void setRead(n.id, n.unread)} className={actionClass}>
                        {n.unread ? "Mark read" : "Mark unread"}
                      </button>
                      <button type="button" onClick={() => void setArchived(n.id, !n.archived)} className={actionClass}>
                        {n.archived ? "Restore" : "Archive"}
                      </button>
                    </div>

                    {pickError?.id === n.id ? (
                      <p className="mt-1 text-[10px] text-ink-red">{pickError.message}</p>
                    ) : null}

                    {reply?.id === n.id ? (
                      <div className="mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={reply.text}
                            maxLength={2000}
                            disabled={reply.sending}
                            placeholder={`Reply to ${n.actorName ?? "them"}…`}
                            onChange={(e) => setReply({ ...reply, text: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void sendReply(n);
                              if (e.key === "Escape") {
                                e.stopPropagation();
                                setReply(null);
                              }
                            }}
                            className="min-w-0 flex-1 rounded-lg border border-ink-black/[0.1] bg-transparent px-2 py-1.5 text-[12px] text-ink-black outline-none placeholder:text-ink-black/25 focus:border-ink-black/25 dark:border-ink-cream/[0.1] dark:text-ink-cream dark:placeholder:text-ink-cream/25 dark:focus:border-ink-cream/25"
                          />
                          <button
                            type="button"
                            onClick={() => void sendReply(n)}
                            disabled={reply.sending || !reply.text.trim()}
                            className={cn(actionClass, redActionClass, "disabled:opacity-40")}
                          >
                            {reply.sending ? "Sending" : "Send"}
                          </button>
                        </div>
                        {reply.error ? (
                          <p className="mt-1 text-[10px] text-ink-red">{reply.error}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {peek?.id === n.id ? (
                      <div className="mt-1.5 rounded-[10px] border border-ink-black/[0.08] bg-ink-parchment-light p-2.5 dark:border-ink-cream/[0.08] dark:bg-ink-black-raised">
                        {peek.loading ? (
                          <p className="font-mono text-[10px] text-ink-black/40 dark:text-ink-cream/40">
                            Loading…
                          </p>
                        ) : peek.error ? (
                          <p className="text-[11px] text-ink-red">{peek.error}</p>
                        ) : peek.request ? (
                          <div className="flex flex-col gap-2">
                            <p className="line-clamp-3 text-[12px] leading-snug text-ink-black/80 dark:text-ink-cream/80">
                              {peek.request.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {peek.request.placement ? (
                                <MetaChip>{peek.request.placement}</MetaChip>
                              ) : null}
                              {peek.request.budgetRange ? (
                                <MetaChip>{peek.request.budgetRange.replace(/-/g, " ")}</MetaChip>
                              ) : null}
                              {peek.request.isMultiSession ? <MetaChip>multi-session</MetaChip> : null}
                            </div>
                            {peek.request.referenceImageUrls.length > 0 ? (
                              <div className="flex gap-1.5">
                                {peek.request.referenceImageUrls.slice(0, 3).map((url) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={url}
                                    src={url}
                                    alt="Reference"
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                ))}
                              </div>
                            ) : null}
                            {effectiveRequestStatus(peek.request, new Date()) === "pending" ? (
                              <div className="flex gap-1.5">
                                <Button
                                  variant="ink"
                                  className="min-h-[44px] flex-1"
                                  onClick={() => openDetail(peek.request as BookingRequestRecord, "accept")}
                                >
                                  Accept…
                                </Button>
                                <Button
                                  variant="ink-outline"
                                  className="min-h-[44px] flex-1"
                                  onClick={() => openDetail(peek.request as BookingRequestRecord, "decline")}
                                >
                                  Decline…
                                </Button>
                              </div>
                            ) : (
                              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-black/40 dark:text-ink-cream/40">
                                Status: {effectiveRequestStatus(peek.request, new Date())}
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <RequestDetailPanel
        key={detail ? `${detail.request.id}:${detail.mode}` : "closed"}
        request={detail?.request ?? null}
        initialMode={detail?.mode ?? "view"}
        onClose={closeDetail}
        onRespond={respond}
        responding={responding}
        error={respondError}
      />

      <CustomerRequestPanel
        request={customerPanel?.request ?? null}
        scheduled={customerPanel?.scheduled ?? false}
        sessionCount={customerPanel?.sessionCount ?? 0}
        onClose={() => {
          setCustomerPanel(null);
          setOpen(true);
        }}
        onChanged={() => {
          // Panel shows its own booked state; bell data is refetched per open.
        }}
      />
    </div>
  );
}

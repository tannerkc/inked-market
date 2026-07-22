"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { notificationContextFromPayload } from "@/lib/booking/notify";
import type { NotificationRecipientContext } from "@/lib/booking/notify";

export interface NotificationItem {
  id: string;
  kind: string;
  message: string;
  /** Name rendered bold in the message; absent on legacy rows. */
  actorName?: string;
  /** Booking request the row's quick actions act on; absent on legacy rows. */
  requestId?: string;
  /** Sender's user id for inline quick-reply; absent on legacy rows. */
  actorUserId?: string;
  /** Recipient's booking role; absent on legacy and non-booking rows. */
  recipientContext?: NotificationRecipientContext;
  createdAt: string;
  unread: boolean;
  archived: boolean;
}

interface DbNotification {
  id: string;
  kind: string;
  payload: {
    message?: string;
    actorName?: string;
    requestId?: string;
    actorUserId?: string;
    recipientContext?: unknown;
  } | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
}

export function useNotificationsFeed() {
  // Auth comes from the provider — never supabase.auth.getUser() in browser
  // components (concurrent calls contend for the auth navigator lock).
  const { user } = useAuth();
  const userId = user?.id;
  const supabaseRef = useRef(createClient());
  const [items, setItems] = useState<NotificationItem[]>([]);

  const unreadCount = items.filter((i) => i.unread && !i.archived).length;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabaseRef.current
        .from("notifications")
        .select("id, kind, payload, read_at, archived_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (cancelled) return;
      const rows = (data ?? []) as DbNotification[];
      setItems(
        rows.map((r) => ({
          id: r.id,
          kind: r.kind,
          message: r.payload?.message ?? r.kind.replace(/_/g, " "),
          actorName: r.payload?.actorName,
          requestId: r.payload?.requestId,
          actorUserId: r.payload?.actorUserId,
          recipientContext: notificationContextFromPayload(r.payload),
          createdAt: r.created_at,
          unread: r.read_at === null,
          archived: r.archived_at !== null,
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setRead = useCallback(async (id: string, read: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: !read } : i)));
    await supabaseRef.current
      .from("notifications")
      .update({ read_at: read ? new Date().toISOString() : null })
      .eq("id", id);
  }, []);

  const setArchived = useCallback(async (id: string, archived: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, archived } : i)));
    await supabaseRef.current
      .from("notifications")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
    await supabaseRef.current
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  }, []);

  return { items, unreadCount, setRead, setArchived, markAllRead };
}

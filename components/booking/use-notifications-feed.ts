"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  kind: string;
  message: string;
  /** Name rendered bold in the message; absent on legacy rows. */
  actorName?: string;
  createdAt: string;
  unread: boolean;
  archived: boolean;
}

interface DbNotification {
  id: string;
  kind: string;
  payload: { message?: string; actorName?: string } | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
}

export function useNotificationsFeed() {
  const supabaseRef = useRef(createClient());
  const [items, setItems] = useState<NotificationItem[]>([]);

  const unreadCount = items.filter((i) => i.unread && !i.archived).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const { data } = await supabase
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
          createdAt: r.created_at,
          unread: r.read_at === null,
          archived: r.archived_at !== null,
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

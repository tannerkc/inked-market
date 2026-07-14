"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  kind: string;
  message: string;
  createdAt: string;
  unread: boolean;
}

interface DbNotification {
  id: string;
  kind: string;
  payload: { message?: string } | null;
  read_at: string | null;
  created_at: string;
}

export function useNotificationsFeed() {
  const supabaseRef = useRef(createClient());
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
        .select("id, kind, payload, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (cancelled) return;
      const rows = (data ?? []) as DbNotification[];
      setItems(
        rows.map((r) => ({
          id: r.id,
          kind: r.kind,
          message: r.payload?.message ?? r.kind.replace(/_/g, " "),
          createdAt: r.created_at,
          unread: r.read_at === null,
        }))
      );
      setUnreadCount(rows.filter((r) => r.read_at === null).length);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
    await supabaseRef.current
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  }, []);

  return { items, unreadCount, markAllRead };
}

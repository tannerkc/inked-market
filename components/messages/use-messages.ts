"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchInbox,
  fetchThread,
  markConversationRead,
  resolveRecipient,
  sendMessage,
} from "@/app/messages/actions";
import type {
  InboxConversation,
  MessagePartner,
  ThreadMessage,
} from "@/lib/types/messaging";
import { MESSAGES_READ_EVENT } from "./messages-nav-button";

/** Sentinel key for a not-yet-created conversation opened via ?to= deep link. */
export const DRAFT_ID = "draft";
const POLL_MS = 5000;

export interface ThreadState {
  messages: ThreadMessage[];
  hasMore: boolean;
  loaded: boolean;
  loadingOlder: boolean;
}

const EMPTY_THREAD: ThreadState = {
  messages: [],
  hasMore: false,
  loaded: false,
  loadingOlder: false,
};

/** Selected-conversation URL sync without an RSC round trip; drafts keep ?to=. */
function syncUrl(conversationId: string | null) {
  window.history.replaceState(
    null,
    "",
    conversationId ? `/messages?c=${conversationId}` : "/messages"
  );
}

export function useMessages(
  userId: string | undefined,
  initialConversationId?: string,
  initialTo?: string
) {
  const [conversations, setConversations] = useState<InboxConversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftPartner, setDraftPartner] = useState<MessagePartner | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, ThreadState>>({});
  const initedRef = useRef(false);
  const threadsRef = useRef(threads);
  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  const refreshInbox = useCallback(async () => {
    const res = await fetchInbox();
    if (res.ok) setConversations(res.conversations);
    else setConversations((prev) => prev ?? []);
  }, []);

  /** Refetch the newest page of a thread; keeps older pages and pending temps. */
  const refreshThread = useCallback(
    async (conversationId: string): Promise<boolean> => {
      const res = await fetchThread({ conversationId });
      if (!res.ok) return false;
      const sawIncomingUnread = res.messages.some((m) => m.senderId !== userId && !m.read);
      setThreads((prev) => {
        const cur = prev[conversationId];
        const ids = new Set(res.messages.map((m) => m.id));
        const oldest = res.messages[0]?.createdAt;
        const olderKept = (cur?.messages ?? []).filter(
          (m) => !m.status && !ids.has(m.id) && oldest !== undefined && m.createdAt < oldest
        );
        const temps = (cur?.messages ?? []).filter((m) => m.status && !ids.has(m.id));
        return {
          ...prev,
          [conversationId]: {
            messages: [...olderKept, ...res.messages, ...temps],
            hasMore: olderKept.length > 0 ? (cur?.hasMore ?? res.hasMore) : res.hasMore,
            loaded: true,
            loadingOlder: cur?.loadingOlder ?? false,
          },
        };
      });
      return sawIncomingUnread;
    },
    [userId]
  );

  /** Zero the badge locally, persist the read receipt, nudge the nav badge. */
  const markRead = useCallback((conversationId: string) => {
    setConversations(
      (prev) => prev?.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)) ?? prev
    );
    void markConversationRead(conversationId).then(() => {
      window.dispatchEvent(new Event(MESSAGES_READ_EVENT));
    });
  }, []);

  const select = useCallback(
    (id: string | null) => {
      setActiveId(id);
      setNotice(null);
      if (id !== DRAFT_ID) setDraftPartner(null);
      if (id && id !== DRAFT_ID) {
        syncUrl(id);
        setThreads((prev) => (prev[id] ? prev : { ...prev, [id]: EMPTY_THREAD }));
        markRead(id);
        void refreshThread(id);
      } else if (id === null) {
        syncUrl(null);
      }
    },
    [markRead, refreshThread]
  );

  // Initial load: inbox, then any deep link (?to= recipient or ?c= conversation).
  // State updates stay inside .then callbacks (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!userId || initedRef.current) return;
    initedRef.current = true;
    void fetchInbox().then((res) => {
      if (res.ok) setConversations(res.conversations);
      else setConversations((prev) => prev ?? []);
    });
    if (initialTo) {
      void resolveRecipient(initialTo).then((res) => {
        if (!res.ok) {
          setNotice(res.error);
        } else if (res.conversationId) {
          select(res.conversationId);
        } else {
          setDraftPartner(res.partner);
          setActiveId(DRAFT_ID);
        }
      });
    } else if (initialConversationId) {
      void Promise.resolve().then(() => select(initialConversationId));
    }
  }, [userId, initialTo, initialConversationId, select]);

  // Live updates: poll while the tab is visible, refresh instantly on refocus.
  useEffect(() => {
    if (!userId) return;
    const tick = () => {
      if (document.hidden) return;
      void refreshInbox();
      if (activeId && activeId !== DRAFT_ID) {
        void refreshThread(activeId).then((sawIncomingUnread) => {
          if (sawIncomingUnread && !document.hidden) markRead(activeId);
        });
      }
    };
    const interval = setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, activeId, refreshInbox, refreshThread, markRead]);

  /** Optimistic send; returns a user-facing error string or null on success. */
  const send = useCallback(
    async (content: string, attachments: string[]): Promise<string | null> => {
      if (!userId) return "Sign in first.";
      const isDraft = activeId === DRAFT_ID;
      const targetKey = activeId;
      if (!targetKey || (isDraft && !draftPartner)) return "Pick a conversation first.";

      const temp: ThreadMessage = {
        id: `tmp-${crypto.randomUUID()}`,
        conversationId: targetKey,
        senderId: userId,
        content,
        attachments,
        read: false,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      setThreads((prev) => ({
        ...prev,
        [targetKey]: {
          ...(prev[targetKey] ?? EMPTY_THREAD),
          loaded: true,
          messages: [...(prev[targetKey]?.messages ?? []), temp],
        },
      }));

      const res = await sendMessage({
        conversationId: isDraft ? undefined : targetKey,
        toUserId: isDraft ? draftPartner!.id : undefined,
        content,
        attachments,
      });

      if (!res.ok) {
        setThreads((prev) => ({
          ...prev,
          [targetKey]: {
            ...(prev[targetKey] ?? EMPTY_THREAD),
            messages: (prev[targetKey]?.messages ?? []).map((m) =>
              m.id === temp.id ? { ...m, status: "failed" as const } : m
            ),
          },
        }));
        return res.error;
      }

      setThreads((prev) => {
        const source = prev[targetKey] ?? EMPTY_THREAD;
        const next = {
          ...prev,
          [res.conversationId]: {
            ...source,
            loaded: true,
            messages: source.messages.map((m) => (m.id === temp.id ? res.message : m)),
          },
        };
        if (isDraft) delete next[DRAFT_ID];
        return next;
      });

      const partnerForNew = isDraft ? draftPartner : null;
      if (isDraft) {
        setDraftPartner(null);
        setActiveId(res.conversationId);
        syncUrl(res.conversationId);
      }

      const preview = (content || "Sent a photo").slice(0, 140);
      setConversations((prev) => {
        const cur = prev?.find((c) => c.id === res.conversationId);
        const partner = cur?.partner ?? partnerForNew;
        if (!partner) return prev;
        const bumped: InboxConversation = {
          id: res.conversationId,
          partner,
          lastMessage: preview,
          lastMessageAt: res.message.createdAt,
          unread: cur?.unread ?? 0,
        };
        return [bumped, ...(prev ?? []).filter((c) => c.id !== res.conversationId)];
      });
      return null;
    },
    [activeId, draftPartner, userId]
  );

  /** Re-send a failed message with the same content. */
  const retry = useCallback(
    async (message: ThreadMessage) => {
      const key = activeId;
      if (!key) return;
      setThreads((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? EMPTY_THREAD),
          messages: (prev[key]?.messages ?? []).filter((m) => m.id !== message.id),
        },
      }));
      await send(message.content, message.attachments);
    },
    [activeId, send]
  );

  /** Drop a failed message without re-sending. */
  const discard = useCallback(
    (message: ThreadMessage) => {
      const key = activeId;
      if (!key) return;
      setThreads((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? EMPTY_THREAD),
          messages: (prev[key]?.messages ?? []).filter((m) => m.id !== message.id),
        },
      }));
    },
    [activeId]
  );

  const loadOlder = useCallback(async () => {
    const key = activeId;
    if (!key || key === DRAFT_ID) return;
    const state = threadsRef.current[key];
    if (!state || state.loadingOlder || !state.hasMore) return;
    const before = state.messages.find((m) => !m.status)?.createdAt;
    if (!before) return;

    setThreads((prev) => ({ ...prev, [key]: { ...prev[key]!, loadingOlder: true } }));
    const res = await fetchThread({ conversationId: key, before });
    setThreads((prev) => {
      const cur = prev[key] ?? EMPTY_THREAD;
      if (!res.ok) return { ...prev, [key]: { ...cur, loadingOlder: false } };
      const ids = new Set(cur.messages.map((m) => m.id));
      const older = res.messages.filter((m) => !ids.has(m.id));
      return {
        ...prev,
        [key]: {
          ...cur,
          messages: [...older, ...cur.messages],
          hasMore: res.hasMore,
          loadingOlder: false,
        },
      };
    });
  }, [activeId]);

  const activeConversation =
    activeId && activeId !== DRAFT_ID
      ? (conversations?.find((c) => c.id === activeId) ?? null)
      : null;
  const activePartner = activeId === DRAFT_ID ? draftPartner : (activeConversation?.partner ?? null);
  const activeThread = activeId ? (threads[activeId] ?? EMPTY_THREAD) : null;
  /** The ?c= id points at nothing we can see (bad link, or someone else's thread). */
  const activeNotFound =
    activeId !== null &&
    activeId !== DRAFT_ID &&
    conversations !== null &&
    !conversations.some((c) => c.id === activeId);

  return {
    conversations,
    activeId,
    activeConversation,
    activePartner,
    activeThread,
    activeNotFound,
    isDraft: activeId === DRAFT_ID,
    notice,
    dismissNotice: () => setNotice(null),
    select,
    send,
    retry,
    discard,
    loadOlder,
  };
}

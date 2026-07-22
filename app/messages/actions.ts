"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { artistUserId, notifyUser, studioOwnerUserId } from "@/lib/booking/notify";
import { effectiveRequestStatus } from "@/lib/supabase/booking-types";
import type { RequestStatus } from "@/lib/types/booking";
import {
  ConversationIdSchema,
  SendMessageSchema,
  ThreadQuerySchema,
  type SendMessageInput,
  type ThreadQuery,
} from "@/lib/validation/schemas";
import type {
  InboxConversation,
  MessagePartner,
  ThreadMessage,
} from "@/lib/types/messaging";

const GENERIC_ERROR = "Something went wrong — try again.";
const THREAD_PAGE = 50;

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

interface DbConversation {
  id: string;
  participant_ids: string[];
  last_message: string | null;
  last_message_at: string;
}

interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: string[] | null;
  read: boolean;
  created_at: string;
}

const mapMessage = (m: DbMessage): ThreadMessage => ({
  id: m.id,
  conversationId: m.conversation_id,
  senderId: m.sender_id,
  content: m.content,
  attachments: m.attachments ?? [],
  read: m.read,
  createdAt: m.created_at,
});

/**
 * Public-safe identity for conversation partners. Profiles RLS is own-row-only,
 * so hydration goes through the admin client and exposes display fields only.
 * Studio owners surface under their studio's brand name; artists/studios get a
 * link to their public page.
 */
async function loadPartners(userIds: string[]): Promise<Record<string, MessagePartner>> {
  if (userIds.length === 0) return {};
  const admin = createAdminClient();
  const idList = userIds.join(",");
  const [profilesRes, artistsRes, studiosRes] = await Promise.all([
    admin.from("profiles").select("id, name, avatar_url, role").in("id", userIds),
    admin
      .from("artists")
      .select("id, slug, user_id, claimed_by")
      .or(`user_id.in.(${idList}),claimed_by.in.(${idList})`),
    admin.from("studios").select("id, slug, name, claimed_by").in("claimed_by", userIds),
  ]);

  const partners: Record<string, MessagePartner> = {};
  for (const p of profilesRes.data ?? []) {
    partners[p.id] = {
      id: p.id,
      name: p.name ?? "Member",
      avatarUrl: p.avatar_url ?? undefined,
      role: p.role === "artist" || p.role === "studio" ? p.role : "customer",
    };
  }
  for (const a of artistsRes.data ?? []) {
    const partner = partners[a.user_id ?? a.claimed_by ?? ""];
    if (partner) partner.profileHref = `/artists/${a.slug ?? a.id}`;
  }
  for (const s of studiosRes.data ?? []) {
    const partner = partners[s.claimed_by ?? ""];
    if (!partner) continue;
    partner.profileHref = `/studios/${s.slug ?? s.id}`;
    if (partner.role === "studio" && s.name) partner.name = s.name;
  }
  // Participants whose account vanished still need a row to render against.
  for (const id of userIds) partners[id] ??= { id, name: "Former member", role: "customer" };
  return partners;
}

/** All conversations for the signed-in user, newest activity first. */
export async function fetchInbox(): Promise<
  { ok: true; conversations: InboxConversation[] } | Fail
> {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return fail("Sign in to see your messages.");

    const { data, error } = await supabase
      .from("conversations")
      .select("id, participant_ids, last_message, last_message_at")
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) return fail(GENERIC_ERROR);
    const rows = (data ?? []) as DbConversation[];
    if (rows.length === 0) return { ok: true, conversations: [] };

    const conversationIds = rows.map((c) => c.id);
    const partnerIds = [
      ...new Set(rows.flatMap((c) => c.participant_ids.filter((id) => id !== user.id))),
    ];
    const [unreadRes, requestsRes, partners] = await Promise.all([
      // ponytail: unread = one row per unread message; swap for a count RPC if inboxes get heavy.
      supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("read", false)
        .neq("sender_id", user.id),
      // Latest linked booking request per thread (RLS hides other people's requests).
      supabase
        .from("booking_requests")
        .select("id, conversation_id, status, expires_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false }),
      loadPartners(partnerIds),
    ]);

    const unreadByConvo: Record<string, number> = {};
    for (const r of unreadRes.data ?? []) {
      unreadByConvo[r.conversation_id] = (unreadByConvo[r.conversation_id] ?? 0) + 1;
    }
    const bookingByConvo: Record<string, { requestId: string; status: string }> = {};
    for (const r of requestsRes.data ?? []) {
      if (r.conversation_id && !bookingByConvo[r.conversation_id]) {
        bookingByConvo[r.conversation_id] = {
          requestId: r.id,
          status: effectiveRequestStatus(
            { status: r.status as RequestStatus, expiresAt: r.expires_at },
            new Date()
          ),
        };
      }
    }

    return {
      ok: true,
      conversations: rows.map((c) => {
        const partnerId = c.participant_ids.find((id) => id !== user.id) ?? user.id;
        return {
          id: c.id,
          partner: partners[partnerId] ?? { id: partnerId, name: "Member", role: "customer" },
          lastMessage: c.last_message ?? undefined,
          lastMessageAt: c.last_message_at,
          unread: unreadByConvo[c.id] ?? 0,
          booking: bookingByConvo[c.id],
        };
      }),
    };
  } catch {
    return fail(GENERIC_ERROR);
  }
}

/** One page of a conversation, oldest→newest. RLS scopes access to participants. */
export async function fetchThread(
  input: ThreadQuery
): Promise<{ ok: true; messages: ThreadMessage[]; hasMore: boolean } | Fail> {
  try {
    const parsed = ThreadQuerySchema.safeParse(input);
    if (!parsed.success) return fail(GENERIC_ERROR);
    const { supabase, user } = await requireUser();
    if (!user) return fail("Sign in to see your messages.");

    let query = supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, attachments, read, created_at")
      .eq("conversation_id", parsed.data.conversationId)
      .order("created_at", { ascending: false })
      .limit(THREAD_PAGE + 1);
    if (parsed.data.before) query = query.lt("created_at", parsed.data.before);
    const { data, error } = await query;
    if (error) return fail(GENERIC_ERROR);

    const rows = (data ?? []) as DbMessage[];
    const hasMore = rows.length > THREAD_PAGE;
    const page = hasMore ? rows.slice(0, THREAD_PAGE) : rows;
    return { ok: true, messages: page.reverse().map(mapMessage), hasMore };
  } catch {
    return fail(GENERIC_ERROR);
  }
}

/**
 * Send a message into an existing conversation, or start one with `toUserId`
 * (find-or-create, so a booking system-line thread is always reused).
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<{ ok: true; conversationId: string; message: ThreadMessage } | Fail> {
  try {
    const parsed = SendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
    }
    const { supabase, user } = await requireUser();
    if (!user) return fail("Sign in to send messages.");
    const { toUserId, content, attachments } = parsed.data;

    let conversationId = parsed.data.conversationId ?? null;
    let partnerId: string | null = null;

    if (conversationId) {
      const { data: convo } = await supabase
        .from("conversations")
        .select("id, participant_ids")
        .eq("id", conversationId)
        .maybeSingle();
      if (!convo) return fail("That conversation is no longer available.");
      partnerId = (convo.participant_ids as string[]).find((id) => id !== user.id) ?? null;
    } else if (toUserId) {
      if (toUserId === user.id) return fail("You can't message yourself.");
      const admin = createAdminClient();
      const { data: recipient } = await admin
        .from("profiles")
        .select("id, privacy")
        .eq("id", toUserId)
        .maybeSingle();
      if (!recipient) return fail("That account no longer exists.");
      const allow = (recipient.privacy as { allowMessages?: boolean } | null)?.allowMessages;
      if (allow === false) return fail("They aren't accepting new messages right now.");
      partnerId = toUserId;

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .contains("participant_ids", [user.id, toUserId])
        .limit(1)
        .maybeSingle();
      if (existing) {
        conversationId = existing.id;
      } else {
        // ponytail: two simultaneous first-messages can create two threads;
        // add a unique index on the sorted participant pair if it ever matters.
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({ participant_ids: [user.id, toUserId] })
          .select("id")
          .single();
        if (createErr || !created) return fail(GENERIC_ERROR);
        conversationId = created.id;
      }
    }
    if (!conversationId || !partnerId) return fail(GENERIC_ERROR);

    // Notify only at the start of a burst: if the partner already has unread
    // messages from us, the bell entry they got then still covers this one.
    const { data: pendingBefore } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("sender_id", user.id)
      .eq("read", false)
      .limit(1);

    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content, attachments })
      .select("id, conversation_id, sender_id, content, attachments, read, created_at")
      .single();
    if (insertErr || !inserted) return fail(GENERIC_ERROR);

    const preview = (content || "Sent a photo").slice(0, 140);
    await supabase
      .from("conversations")
      .update({ last_message: preview, last_message_at: inserted.created_at })
      .eq("id", conversationId);

    if ((pendingBefore ?? []).length === 0) {
      const { data: me } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      await notifyUser(createAdminClient(), partnerId, "message_received", {
        actorName: me?.name ?? "Someone",
        actorUserId: user.id,
      });
    }

    return { ok: true, conversationId, message: mapMessage(inserted as DbMessage) };
  } catch {
    return fail(GENERIC_ERROR);
  }
}

/** Mark every message from the other participant as read (their read receipt). */
export async function markConversationRead(conversationId: string): Promise<{ ok: boolean }> {
  try {
    if (!ConversationIdSchema.safeParse(conversationId).success) return { ok: false };
    const { supabase, user } = await requireUser();
    if (!user) return { ok: false };
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

/**
 * Resolve a `?to=` deep-link ("artist:<id>", "studio:<id>", or a raw user id)
 * into a message partner plus any conversation that already exists with them.
 */
export async function resolveRecipient(
  to: string
): Promise<{ ok: true; partner: MessagePartner; conversationId: string | null } | Fail> {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return fail("Sign in to send messages.");

    const [kind, id] = to.includes(":") ? to.split(":", 2) : ["user", to];
    if (!id || !ConversationIdSchema.safeParse(id).success) {
      // Sample/mock entities land here — they have no real account behind them.
      return fail("This profile isn't set up for messaging yet.");
    }

    const admin = createAdminClient();
    let userId: string | null = id;
    if (kind === "artist") userId = await artistUserId(admin, id);
    else if (kind === "studio") userId = await studioOwnerUserId(admin, id);
    if (!userId) return fail("They haven't set up messaging yet.");
    if (userId === user.id) return fail("That's your own profile.");

    const partners = await loadPartners([userId]);
    const partner = partners[userId]!;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .contains("participant_ids", [user.id, userId])
      .limit(1)
      .maybeSingle();

    if (!existing) {
      // New thread: respect the recipient's "allow messages" privacy switch.
      const { data: recipient } = await admin
        .from("profiles")
        .select("privacy")
        .eq("id", userId)
        .maybeSingle();
      const allow = (recipient?.privacy as { allowMessages?: boolean } | null)?.allowMessages;
      if (allow === false) return fail("They aren't accepting new messages right now.");
    }

    return { ok: true, partner, conversationId: existing?.id ?? null };
  } catch {
    return fail(GENERIC_ERROR);
  }
}

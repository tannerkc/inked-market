import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Best-effort system-line into the customer-artist conversation (009 schema:
 * participant_ids array + denormalized last_message/unread_count). The acting
 * artist is the honest sender. Failures are silent — messaging color must
 * never break a booking transition.
 */
export async function postBookingMessage(
  admin: SupabaseClient,
  input: {
    /** The responding party's user id (artist user or studio owner). */
    senderUserId: string;
    customerId: string;
    content: string;
    requestId: string;
  }
): Promise<void> {
  try {
    const { senderUserId, customerId, content, requestId } = input;

    // Find-or-create the two-party conversation.
    const { data: existing } = await admin
      .from("conversations")
      .select("id, unread_count")
      .contains("participant_ids", [senderUserId, customerId])
      .limit(1)
      .maybeSingle();

    let conversationId: string;
    if (existing) {
      conversationId = existing.id;
      const unread = { ...((existing.unread_count as Record<string, number>) ?? {}) };
      unread[customerId] = (unread[customerId] ?? 0) + 1;
      await admin
        .from("conversations")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_count: unread,
        })
        .eq("id", conversationId);
    } else {
      const { data: created } = await admin
        .from("conversations")
        .insert({
          participant_ids: [senderUserId, customerId],
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_count: { [customerId]: 1 },
        })
        .select("id")
        .single();
      if (!created) return;
      conversationId = created.id;
    }

    await admin.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderUserId,
      content,
    });
    await admin
      .from("booking_requests")
      .update({ conversation_id: conversationId })
      .eq("id", requestId);
  } catch {
    // Swallow — conversational color only.
  }
}

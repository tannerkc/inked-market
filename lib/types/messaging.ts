// Direct-messaging view types (009 schema). Dates cross the server-action
// boundary as ISO strings so views stay trivially serializable.

export interface MessagePartner {
  /** The partner's auth user id. */
  id: string;
  name: string;
  avatarUrl?: string;
  role: "customer" | "artist" | "studio";
  /** Public page for artists/studios; customers have none. */
  profileHref?: string;
}

export interface InboxConversation {
  id: string;
  partner: MessagePartner;
  lastMessage?: string;
  lastMessageAt: string;
  /** Unread messages addressed to the current user. */
  unread: number;
  /** Latest booking request linked to this thread, if any (lazy-expired status). */
  booking?: { requestId: string; status: string };
}

export interface ThreadMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  /** True once the other participant has seen it (read receipt). */
  read: boolean;
  createdAt: string;
  /** Client-only optimistic state; never set on server rows. */
  status?: "sending" | "failed";
}

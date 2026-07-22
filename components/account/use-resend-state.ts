"use client";

import { useState } from "react";

/** Shared resend-button state: fires the action, tracks pending + status message. */
export function useResendState(action: () => Promise<{ ok: boolean; message: string }>) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (sending) return;
    setSending(true);
    setStatus("");
    const result = await action();
    setStatus(result.message);
    setSending(false);
  };

  return { send, status, sending };
}

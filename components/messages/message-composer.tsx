"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { uploadBookingReference } from "@/lib/utils/image-upload";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  /** Fire-and-forget: failures surface as a failed bubble in the thread. */
  onSend: (content: string, attachments: string[]) => Promise<string | null>;
  userId: string;
}

const MAX_LENGTH = 2000;
const MAX_ATTACHMENTS = 4;

const MessageComposer = ({ onSend, userId }: MessageComposerProps) => {
  // ponytail: attachments reuse the booking-refs bucket ({userId}/{uuid} paths,
  // owner-scoped writes) — give messaging its own bucket if usage diverges.
  const [supabase] = React.useState(() => createClient());
  const [value, setValue] = React.useState("");
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const canSend =
    uploading === 0 && (value.trim().length > 0 || attachments.length > 0);

  const submit = () => {
    if (!canSend) return;
    const content = value.trim();
    const files = attachments;
    setValue("");
    setAttachments([]);
    setError(null);
    requestAnimationFrame(resize);
    // Optimistic bubble appears immediately; a failure becomes a Retry bubble.
    void onSend(content, files);
    textareaRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    // Touch keyboards keep Enter as newline; the send button is the affordance.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    e.preventDefault();
    submit();
  };

  const onFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const room = MAX_ATTACHMENTS - attachments.length;
    const files = Array.from(list).slice(0, Math.max(room, 0));
    if (list.length > room) setError(`Up to ${MAX_ATTACHMENTS} photos per message`);
    if (files.length === 0) return;
    setUploading((n) => n + files.length);
    await Promise.all(
      files.map(async (file) => {
        const res = await uploadBookingReference(supabase, userId, file);
        if (res.ok) {
          setAttachments((prev) =>
            prev.length < MAX_ATTACHMENTS ? [...prev, res.url] : prev
          );
        } else {
          setError(res.error);
        }
        setUploading((n) => n - 1);
      })
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="shrink-0 border-t border-ink-black/[0.06] px-3 pb-3 pt-2.5 dark:border-ink-cream/[0.06] sm:px-4">
      {error ? <p className="mb-2 flex items-center justify-between gap-2 text-[11px] text-ink-red">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-mono text-[9px] uppercase tracking-wide text-ink-black/35 dark:text-ink-cream/35"
          >
            Dismiss
          </button>
        </p> : null}

      {(attachments.length > 0 || uploading > 0) ? <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((url) => (
            <span key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Attachment preview"
                className="h-14 w-14 rounded-[10px] border border-ink-black/[0.08] object-cover dark:border-ink-cream/[0.08]"
              />
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((u) => u !== url))}
                aria-label="Remove attachment"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-black text-[11px] leading-none text-ink-cream dark:bg-ink-cream dark:text-ink-black"
              >
                ×
              </button>
            </span>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <span
              key={`up-${i}`}
              className="h-14 w-14 animate-pulse rounded-[10px] border border-dashed border-ink-black/20 dark:border-ink-cream/20"
            />
          ))}
        </div> : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void onFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={attachments.length >= MAX_ATTACHMENTS}
          aria-label="Attach photos"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-black/40 transition-colors hover:bg-ink-black/[0.05] hover:text-ink-black disabled:pointer-events-none disabled:opacity-30 dark:text-ink-cream/40 dark:hover:bg-ink-cream/[0.07] dark:hover:text-ink-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-5-5-8 8" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={onKeyDown}
          placeholder="Write a message"
          aria-label="Write a message"
          className="max-h-[140px] min-h-[40px] flex-1 resize-none rounded-[16px] border border-ink-black/10 bg-ink-black/[0.02] px-3.5 py-2.5 text-[13px] leading-snug text-ink-black outline-none transition-colors placeholder:text-ink-black/30 focus:border-ink-black/25 dark:border-ink-cream/15 dark:bg-ink-cream/[0.03] dark:text-ink-cream dark:placeholder:text-ink-cream/30 dark:focus:border-ink-cream/30"
        />

        <Button
          variant="ink-red"
          size="sm"
          onClick={submit}
          disabled={!canSend}
          className={cn("shrink-0", !canSend && "pointer-events-none opacity-40")}
        >
          Send
        </Button>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between">
        <p className="hidden font-mono text-[8px] uppercase tracking-[0.15em] text-ink-black/20 dark:text-ink-cream/20 sm:block">
          Enter to send · Shift+Enter for a new line
        </p>
        {value.length > MAX_LENGTH - 200 ? <p className="ml-auto font-mono text-[9px] text-ink-black/35 dark:text-ink-cream/35">
            {MAX_LENGTH - value.length}
          </p> : null}
      </div>
    </div>
  );
};
MessageComposer.displayName = "MessageComposer";

export { MessageComposer };
export type { MessageComposerProps };

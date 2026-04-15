import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  variant?: "light" | "dark";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, variant = "light", rows = 5, id, ...props }, ref) => {
    const isLight = variant === "light";
    const textareaId = id ?? React.useId();

    return (
      <div
        className={cn(
          "rounded-xl px-5 py-4 text-left",
          isLight
            ? "bg-white border border-ink-black/[0.06] focus-within:border-ink-black/20"
            : "bg-ink-cream/[0.04] border border-ink-cream/[0.08] focus-within:border-ink-cream/20",
          "transition-colors",
          className
        )}
      >
        <label
          htmlFor={textareaId}
          className={cn(
            "block font-mono text-[9px] tracking-[0.15em] uppercase",
            isLight ? "text-ink-black/30" : "text-ink-cream/30"
          )}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full bg-transparent text-[15px] mt-1 outline-none resize-y placeholder:opacity-20",
            isLight
              ? "text-ink-black placeholder:text-ink-black"
              : "text-ink-cream placeholder:text-ink-cream"
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

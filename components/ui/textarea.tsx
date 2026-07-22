import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, rows = 5, id, ...props }, ref) => {
    const textareaId = id ?? React.useId();

    return (
      <div
        className={cn(
          "rounded-xl px-5 py-4 text-left transition-colors",
          "bg-white border border-ink-black/[0.06] focus-within:border-ink-black/20",
          "dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08] dark:focus-within:border-ink-cream/20",
          className
        )}
      >
        <label
          htmlFor={textareaId}
          className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/30 dark:text-ink-cream/30"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full bg-transparent text-[15px] mt-1 outline-none resize-y placeholder:opacity-20",
            "text-ink-black placeholder:text-ink-black",
            "dark:text-ink-cream dark:placeholder:text-ink-cream"
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

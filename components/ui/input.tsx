import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: "light" | "dark";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, variant = "light", id, ...props }, ref) => {
    const isLight = variant === "light";
    const inputId = id ?? React.useId();

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
          htmlFor={inputId}
          className={cn(
            "block font-mono text-[9px] tracking-[0.15em] uppercase",
            isLight ? "text-ink-black/30" : "text-ink-cream/30"
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent text-[15px] mt-1 outline-none placeholder:opacity-20",
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

Input.displayName = "Input";

export { Input };

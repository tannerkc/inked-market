import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

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
          htmlFor={inputId}
          className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/30 dark:text-ink-cream/30"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent text-[15px] mt-1 outline-none placeholder:opacity-20",
            "text-ink-black placeholder:text-ink-black",
            "dark:text-ink-cream dark:placeholder:text-ink-cream"
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder = "Select…", id, ...props }, ref) => {
    const selectId = id ?? React.useId();

    return (
      <div
        className={cn(
          "relative rounded-xl px-5 py-4 text-left transition-colors",
          "bg-white border border-ink-black/[0.06] focus-within:border-ink-black/20",
          "dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08] dark:focus-within:border-ink-cream/20",
          className
        )}
      >
        <label
          htmlFor={selectId}
          className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/30 dark:text-ink-cream/30"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full bg-transparent text-[15px] mt-1 outline-none appearance-none pr-6",
            "text-ink-black dark:text-ink-cream"
          )}
          {...props}
        >
          <option value="" disabled className="text-black/40">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-5 bottom-5 w-4 h-4 text-ink-black/25 dark:text-ink-cream/25"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

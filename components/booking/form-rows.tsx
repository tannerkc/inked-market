"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";

/** Shared field primitives for booking forms (settings panel, request flow, accept form). */

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[12px] font-medium text-ink-black/70 dark:text-ink-cream/70">
      {children}
    </p>
  );
}

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-center gap-3">
      <ToggleSwitch checked={checked} onChange={onChange} />
      <div>
        <FieldLabel>{label}</FieldLabel>
        <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">{hint}</p>
      </div>
    </div>
  );
}

/** Tap-to-select chip set; tapping the active chip clears it (optional fields). */
export function ChipGroup({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel>{label}</FieldLabel>
        {hint ? (
          <p className="font-mono text-[10px] text-ink-black/25 dark:text-ink-cream/25">{hint}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : o.value)}
              className={`min-h-[44px] rounded-full border px-4 font-mono text-[11px] transition-colors ${
                active
                  ? "border-ink-black bg-ink-black text-ink-cream dark:border-ink-cream dark:bg-ink-cream dark:text-ink-black"
                  : "border-ink-black/[0.08] text-ink-black/60 hover:border-ink-black/30 dark:border-ink-cream/[0.08] dark:text-ink-cream/60 dark:hover:border-ink-cream/30"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Single-line text input in the same boxed shell as the Textarea primitive. */
export function BoxedInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block cursor-text rounded-xl border border-ink-black/[0.06] bg-white px-5 py-4 transition-colors focus-within:border-ink-black/20 dark:border-ink-cream/[0.08] dark:bg-ink-cream/[0.04] dark:focus-within:border-ink-cream/20">
      <span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-black/30 dark:text-ink-cream/30">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1 w-full bg-transparent text-[15px] text-ink-black outline-none placeholder:text-ink-black placeholder:opacity-20 dark:text-ink-cream dark:placeholder:text-ink-cream"
      />
    </label>
  );
}

export function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] rounded-lg border border-ink-black/[0.08] bg-transparent px-3 font-mono text-[12px] dark:border-ink-cream/[0.08]"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

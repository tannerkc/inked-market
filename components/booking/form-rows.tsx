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

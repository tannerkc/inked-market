"use client";

import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

interface SettingsToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  warning?: string;
  disabled?: boolean;
  disabledNote?: string;
}

function SettingsToggleRow({ label, description, checked, onChange, warning, disabled, disabledNote }: SettingsToggleRowProps) {
  return (
    <div className={cn("py-3", disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
            {label}
          </p>
          <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
            {description}
          </p>
        </div>
        <ToggleSwitch checked={checked} onChange={disabled ? () => {} : onChange} size="sm" />
      </div>
      {disabled && disabledNote && (
        <p className="text-[10px] text-ink-rust/60 mt-1.5">{disabledNote}</p>
      )}
      {warning && !checked && !disabled && (
        <p className="text-[10px] text-ink-rust/70 mt-1.5">{warning}</p>
      )}
    </div>
  );
}

function SettingsGroupLabel({ label }: { label: string }) {
  return (
    <p className="font-mono text-[8px] tracking-[0.2em] uppercase mt-5 mb-1 px-1 text-ink-black/25 dark:text-ink-cream/25">
      {label}
    </p>
  );
}

export { SettingsToggleRow, SettingsGroupLabel };
export type { SettingsToggleRowProps };

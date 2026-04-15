"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
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
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={cn("py-3", disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={cn("text-[12px] font-medium", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
            {label}
          </p>
          <p className={cn("text-[10px] mt-0.5", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
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
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <p
      className={cn(
        "font-mono text-[8px] tracking-[0.2em] uppercase mt-5 mb-1 px-1",
        isDark ? "text-ink-cream/25" : "text-ink-black/25"
      )}
    >
      {label}
    </p>
  );
}

export { SettingsToggleRow, SettingsGroupLabel };
export type { SettingsToggleRowProps };

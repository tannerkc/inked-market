"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  confirmVariant?: "ink" | "ink-red";
  onConfirm: () => void;
  requireTyped?: string;
}

export function ConfirmationDialog({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  confirmVariant = "ink-red",
  onConfirm,
  requireTyped,
}: ConfirmationDialogProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [typed, setTyped] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Reset typed on open/close
  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  // Escape to close
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  const canConfirm = requireTyped ? typed === requireTyped : true;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-[420px] rounded-[20px] border p-6",
          isDark
            ? "bg-ink-black border-ink-cream/[0.08]"
            : "bg-ink-cream border-ink-black/[0.08]"
        )}
      >
        <h3 className={cn("text-[16px] font-semibold mb-3", isDark ? "text-ink-cream/80" : "text-ink-black/80")}>
          {title}
        </h3>

        <div className="mb-5">{children}</div>

        {requireTyped && (
          <div className="mb-4">
            <p className={cn("text-[10px] mb-2", isDark ? "text-ink-cream/30" : "text-ink-black/30")}>
              Type <span className="font-mono font-medium text-ink-red">{requireTyped}</span> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyped}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-[13px] outline-none font-mono transition-colors",
                isDark
                  ? "bg-ink-cream/[0.04] border border-ink-cream/[0.08] text-ink-cream placeholder:text-ink-cream/15 focus:border-ink-red/30"
                  : "bg-white border border-ink-black/[0.06] text-ink-black placeholder:text-ink-black/15 focus:border-ink-red/30"
              )}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant={isDark ? "ink-light-outline" : "ink-outline"} size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={cn(!canConfirm && "opacity-40 cursor-not-allowed")}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

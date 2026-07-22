"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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
      <div className="relative w-full max-w-[420px] rounded-[20px] border p-6 bg-ink-cream border-ink-black/[0.08] dark:bg-ink-black dark:border-ink-cream/[0.08]">
        <h3 className="text-[16px] font-semibold mb-3 text-ink-black/80 dark:text-ink-cream/80">
          {title}
        </h3>

        <div className="mb-5">{children}</div>

        {requireTyped && (
          <div className="mb-4">
            <p className="text-[10px] mb-2 text-ink-black/30 dark:text-ink-cream/30">
              Type <span className="font-mono font-medium text-ink-red">{requireTyped}</span> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyped}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-[13px] outline-none font-mono transition-colors",
                "bg-white border border-ink-black/[0.06] text-ink-black placeholder:text-ink-black/15 focus:border-ink-red/30",
                "dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08] dark:text-ink-cream dark:placeholder:text-ink-cream/15 dark:focus:border-ink-red/30"
              )}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="ink-outline" size="sm" onClick={onClose}>
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

"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useEntitlement } from "@/lib/hooks/use-entitlement";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { ConfirmationDialog } from "./confirmation-dialog";

export function DangerZoneSection() {
  const { user, logout } = useAuth();

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDeactivate = useCallback(() => {
    // In production this would call an API. For dev, just log out.
    setShowDeactivate(false);
    logout();
  }, [logout]);

  const handleDelete = useCallback(() => {
    // Remove from accounts list
    try {
      const accounts = JSON.parse(localStorage.getItem("inked-market-accounts") || "[]");
      const filtered = accounts.filter((a: { id: string }) => a.id !== user?.id);
      localStorage.setItem("inked-market-accounts", JSON.stringify(filtered));
    } catch {
      // silently continue
    }
    setShowDelete(false);
    logout();
  }, [user?.id, logout]);

  const { tier, source } = useEntitlement();
  const hasPaidPlan = source === "subscription" && tier !== null && tier !== "liner";
  const isStudioWithArtists = user?.role === "studio"; // In production, check roster count
  const isArtistWithStudio = user?.role === "artist"; // In production, check affiliation

  const cardClass = cn(
    "rounded-[16px] border border-dashed p-5",
    "border-ink-red/[0.15] bg-ink-red/[0.02]"
  );

  return (
    <SettingsSection title="Danger Zone" description="Irreversible and destructive actions">
      {/* Deactivate */}
      <div className={cn(cardClass, "mb-4")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
              Deactivate Account
            </p>
            <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
              Hides your profile, pauses billing. Reactivate by logging back in.
            </p>
          </div>
          <Button variant="ink-outline" size="sm" onClick={() => setShowDeactivate(true)}>
            Deactivate
          </Button>
        </div>
      </div>

      {/* Delete */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink-red/70">
              Delete Account
            </p>
            <p className="text-[10px] mt-0.5 text-ink-black/25 dark:text-ink-cream/25">
              Permanently removes your profile, portfolio, and all associated data. This cannot be undone.
            </p>
          </div>
          <Button variant="ink-red" size="sm" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Deactivate Dialog */}
      <ConfirmationDialog
        open={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        title="Deactivate Account"
        confirmLabel="Deactivate"
        confirmVariant="ink"
        onConfirm={handleDeactivate}
      >
        <div className="space-y-2">
          <p className="text-[11px] text-ink-black/40 dark:text-ink-cream/40">
            Your account will be hidden from all public views and your subscription billing will be paused.
          </p>
          <p className="text-[11px] text-ink-black/40 dark:text-ink-cream/40">
            You can reactivate your account at any time by logging back in.
          </p>
        </div>
      </ConfirmationDialog>

      {/* Delete Dialog */}
      <ConfirmationDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Account"
        confirmLabel="Permanently Delete"
        confirmVariant="ink-red"
        onConfirm={handleDelete}
        requireTyped="DELETE"
      >
        <div className="space-y-2">
          <p className="text-[11px] text-ink-black/40 dark:text-ink-cream/40">
            This action is permanent and cannot be undone. The following will be removed:
          </p>
          <ul className="text-[11px] space-y-1 pl-3 text-ink-black/30 dark:text-ink-cream/30">
            <li>• Your profile and all associated data</li>
            {user?.role === "artist" && <li>• Your portfolio and gallery images</li>}
            {user?.role === "studio" && <li>• Your studio listing and page</li>}
            <li>• Your messages</li>
          </ul>

          {isStudioWithArtists && (
            <p className="text-[11px] text-ink-rust/70">
              Your affiliated artists will be notified and their studio affiliation will be removed.
            </p>
          )}
          {isArtistWithStudio && (
            <p className="text-[11px] text-ink-rust/70">
              Your studio will be notified that you&apos;ve left.
            </p>
          )}
          {hasPaidPlan && (
            <p className="text-[11px] text-ink-red/60">
              Your subscription will be cancelled immediately. No refund will be issued for the remaining billing period.
            </p>
          )}

          <p className="text-[10px] mt-2 text-ink-black/20 dark:text-ink-cream/20">
            Your reviews will remain visible but will no longer display your name or link to your profile.
          </p>
        </div>
      </ConfirmationDialog>
    </SettingsSection>
  );
}

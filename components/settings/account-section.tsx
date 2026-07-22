"use client";

import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { useAccountSection } from "./use-account-section";

export function AccountSection() {
  const {
    email,
    expanded,
    toggleExpanded,
    newEmail,
    setNewEmail,
    emailPassword,
    setEmailPassword,
    emailError,
    emailSuccess,
    handleEmailSave,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    passwordSuccess,
    handlePasswordSave,
  } = useAccountSection();

  const inputClass =
    "w-full rounded-xl px-5 py-4 text-[15px] outline-none transition-colors bg-white border border-ink-black/[0.06] text-ink-black placeholder:text-ink-black/20 focus:border-ink-black/20 dark:bg-ink-cream/[0.04] dark:border-ink-cream/[0.08] dark:text-ink-cream dark:placeholder:text-ink-cream/20 dark:focus:border-ink-cream/20";

  const labelClass =
    "block font-mono text-[9px] tracking-[0.15em] uppercase mb-2 text-ink-black/30 dark:text-ink-cream/30";

  const cardClass =
    "rounded-[16px] border p-5 mb-4 border-ink-black/[0.06] bg-ink-black/[0.02] dark:border-ink-cream/[0.06] dark:bg-ink-cream/[0.02]";

  return (
    <SettingsSection title="Account" description="Manage your email address and password">
      {/* Email */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-1">
          <span className={labelClass} style={{ marginBottom: 0 }}>Email Address</span>
          <button
            type="button"
            onClick={() => toggleExpanded("email")}
            className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer"
          >
            {expanded === "email" ? "Cancel" : "Change"}
          </button>
        </div>
        <p className="text-[13px] text-ink-black/60 dark:text-ink-cream/60">
          {email}
        </p>

        {expanded === "email" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your@newemail.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Enter your current password"
                className={inputClass}
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-ink-red/80">{emailError}</p>
            )}
            {emailSuccess && (
              <p className="text-[11px] text-ink-sage">Email updated successfully</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="ink-outline" size="sm" onClick={() => toggleExpanded(null)}>
                Cancel
              </Button>
              <Button variant="ink" size="sm" onClick={handleEmailSave}>
                Save Email
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-1">
          <span className={labelClass} style={{ marginBottom: 0 }}>Password</span>
          <button
            type="button"
            onClick={() => toggleExpanded("password")}
            className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink-rust hover:text-ink-rust/70 transition-colors cursor-pointer"
          >
            {expanded === "password" ? "Cancel" : "Change"}
          </button>
        </div>
        <p className="text-[13px] text-ink-black/30 dark:text-ink-cream/30">
          ••••••••••
        </p>

        {expanded === "password" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={inputClass}
              />
            </div>
            {passwordError && (
              <p className="text-[11px] text-ink-red/80">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-[11px] text-ink-sage">Password updated successfully</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="ink-outline" size="sm" onClick={() => toggleExpanded(null)}>
                Cancel
              </Button>
              <Button variant="ink" size="sm" onClick={handlePasswordSave}>
                Save Password
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Auth */}
      <div className="rounded-[16px] border border-dashed p-5 border-ink-black/[0.06] dark:border-ink-cream/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink-black/50 dark:text-ink-cream/50">
              Two-Factor Authentication
            </p>
            <p className="text-[10px] mt-0.5 text-ink-black/20 dark:text-ink-cream/20">
              Not enabled — Add an extra layer of security
            </p>
          </div>
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-ink-black/[0.04] text-ink-black/25 dark:bg-ink-cream/[0.04] dark:text-ink-cream/25">
            Coming Soon
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}

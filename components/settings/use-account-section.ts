"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";

type ExpandedField = "email" | "password" | null;

export function useAccountSection() {
  const { user, updateUser } = useAuth();
  const [expanded, setExpanded] = useState<ExpandedField>(null);

  // Email change form
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const toggleExpanded = useCallback((field: ExpandedField) => {
    setExpanded((prev) => (prev === field ? null : field));
    // Reset forms when toggling
    setNewEmail("");
    setEmailPassword("");
    setEmailError("");
    setEmailSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
  }, []);

  const handleEmailSave = useCallback(() => {
    setEmailError("");
    if (!newEmail.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!newEmail.includes("@")) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (!emailPassword) {
      setEmailError("Password is required to change email");
      return;
    }

    // In dev mode, verify password against stored accounts
    try {
      const accounts = JSON.parse(localStorage.getItem("inked-market-accounts") || "[]");
      const account = accounts.find((a: { id: string }) => a.id === user?.id);
      if (account && account.password !== emailPassword) {
        setEmailError("Incorrect password");
        return;
      }
    } catch {
      // silently continue
    }

    updateUser({ email: newEmail.trim() });
    setEmailSuccess(true);
    setTimeout(() => {
      setExpanded(null);
      setEmailSuccess(false);
      setNewEmail("");
      setEmailPassword("");
    }, 1500);
  }, [newEmail, emailPassword, user?.id, updateUser]);

  const handlePasswordSave = useCallback(() => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Verify current password
    try {
      const accounts = JSON.parse(localStorage.getItem("inked-market-accounts") || "[]");
      const idx = accounts.findIndex((a: { id: string }) => a.id === user?.id);
      if (idx !== -1) {
        if (accounts[idx].password !== currentPassword) {
          setPasswordError("Incorrect current password");
          return;
        }
        // Update password in accounts list
        accounts[idx].password = newPassword;
        localStorage.setItem("inked-market-accounts", JSON.stringify(accounts));
      }
    } catch {
      // silently continue
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setExpanded(null);
      setPasswordSuccess(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  }, [currentPassword, newPassword, confirmPassword, user?.id]);

  return {
    email: user?.email ?? "",
    expanded,
    toggleExpanded,
    // Email
    newEmail,
    setNewEmail,
    emailPassword,
    setEmailPassword,
    emailError,
    emailSuccess,
    handleEmailSave,
    // Password
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    passwordSuccess,
    handlePasswordSave,
  };
}

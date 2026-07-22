"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon, AppleIcon } from "@/components/ui/auth-icons";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeText,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "@/lib/utils/validation";

interface AuthFormProps {
  nameField?: {
    label: string;
    placeholder: string;
  };
  emailPlaceholder?: string;
  ctaLabel: string;
  onBack?: string;
  onSubmit?: (data: { email: string; password: string; name?: string }) => void | Promise<void>;
  defaultEmail?: string;
  defaultPassword?: string;
  defaultName?: string;
  className?: string;
  error?: string;
  passwordAutoComplete?: string;
  /** Enforce the signup password policy (length + letter + number). Leave off for sign-in. */
  requireStrongPassword?: boolean;
  footer?: React.ReactNode;
}

export function AuthForm({
  nameField,
  emailPlaceholder = "your@email.com",
  ctaLabel,
  onBack,
  onSubmit,
  defaultEmail = "",
  defaultPassword = "",
  defaultName = "",
  className,
  error,
  passwordAutoComplete = "new-password",
  requireStrongPassword = false,
  footer,
}: AuthFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [name, setName] = useState(defaultName);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validationError =
      validateEmail(email) ||
      (requireStrongPassword
        ? validatePassword(password)
        : password
          ? null
          : "Password is required.") ||
      (nameField ? validateName(name, nameField.label) : null);

    setLocalError(validationError ?? "");
    if (validationError || !onSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit({
        email: email.trim(),
        password,
        name: nameField ? sanitizeText(name) : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("space-y-3", className)}>
      <Button type="button" variant="ink" size="lg" statusDot className="w-full">
        Continue with Instagram
      </Button>

      <div className="flex gap-3">
        <Button type="button" variant="ink-outline" size="md" leftIcon={<GoogleIcon />} className="flex-1">
          Google
        </Button>
        <Button type="button" variant="ink-outline" size="md" leftIcon={<AppleIcon />} className="flex-1">
          Apple
        </Button>
      </div>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-ink-black/[0.08]" />
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25">or</span>
        <div className="flex-1 h-px bg-ink-black/[0.08]" />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder={emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        maxLength={EMAIL_MAX_LENGTH}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={passwordAutoComplete}
        maxLength={PASSWORD_MAX_LENGTH}
        required
      />

      {nameField ? (
        <Input
          label={nameField.label}
          type="text"
          placeholder={nameField.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
          required
        />
      ) : null}

      {requireStrongPassword && !displayError ? (
        <p className="text-ink-black/30 text-[10px] font-mono tracking-[0.1em]">
          8+ characters, with at least one letter and one number
        </p>
      ) : null}

      {displayError ? (
        <p className="text-ink-red text-[11px] font-mono tracking-[0.1em]">{displayError}</p>
      ) : null}

      <Button type="submit" variant="ink" size="lg" statusDot className="w-full" disabled={submitting}>
        {submitting ? "One moment…" : ctaLabel}
      </Button>

      <button
        type="button"
        className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/35 hover:text-ink-black/60 transition-colors cursor-pointer"
      >
        Send magic link instead &rarr;
      </button>

      {onBack ? (
        <Link
          href={onBack}
          className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-1"
        >
          &larr; Back
        </Link>
      ) : null}

      {footer}
    </form>
  );
}

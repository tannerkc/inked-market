"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { DrawingCanvas } from "@/components/hero/drawing-canvas";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthForm, SignupDecorations } from "@/components/signup";

export default function LoginPage() {
  const { login, resendConfirmation, isAuthenticated, user } = useAuth();
  const [error, setError] = useState("");
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "artist" || user.role === "studio") window.location.href = "/dashboard";
      else window.location.href = "/";
    }
  }, [isAuthenticated, user]);

  const handleResend = async () => {
    if (!unconfirmedEmail || resending) return;
    setResending(true);
    setResendStatus("");
    const result = await resendConfirmation(unconfirmedEmail);
    setResendStatus(result.message);
    setResending(false);
  };

  return (
    <section className="relative bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark min-h-screen flex items-center justify-center overflow-hidden">
      <SignupDecorations />

      <FilmGrainOverlay className="opacity-[0.025]" />

      <DrawingCanvas />

      <div className="relative z-30 w-full max-w-[380px] mx-auto px-4 text-center pointer-events-none">
        <Eyebrow text="Welcome Back" color="red" />

        <Headline
          variant="mixed"
          words={[
            { text: "Sign", font: "pirata" },
            { text: "In", font: "rye" },
            { text: "To", font: "limelight" },
            { text: "The", font: "marker", color: "text-ink-red" },
            { text: "Scene", font: "cook", color: "text-ink-black" },
          ]}
        />

        <Subtitle
          text="Pick up where you left off. Your saved artists and studios are waiting."
          className="mb-8"
        />

        <AuthForm
          emailPlaceholder="artist@studio.com"
          ctaLabel="Sign In"
          passwordAutoComplete="current-password"
          error={error}
          className="pointer-events-auto"
          onSubmit={async (data) => {
            setError("");
            setUnconfirmedEmail(null);
            setResendStatus("");
            const result = await login(data.email, data.password);
            if (!result.ok) {
              setError(result.message);
              if (result.code === "email_not_confirmed") {
                setUnconfirmedEmail(data.email);
              }
              return;
            }
            if (result.user.role === "artist" || result.user.role === "studio") {
              window.location.href = "/dashboard";
            } else {
              window.location.href = "/";
            }
          }}
          footer={
            <>
              {unconfirmedEmail ? (
                <div className="pt-3 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-red underline hover:text-ink-red/70 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend confirmation email"}
                  </button>
                  {resendStatus ? (
                    <p className="font-mono text-[10px] tracking-[0.1em] text-ink-black/45 pt-2">
                      {resendStatus}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="font-mono text-xs tracking-[0.15em] text-ink-black/30 pt-6 pointer-events-auto">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-ink-black underline hover:text-ink-black/70 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </>
          }
        />
      </div>
    </section>
  );
}

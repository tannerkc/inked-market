"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { DrawingCanvas } from "@/components/hero/drawing-canvas";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";

const loginDecorations = [
  {
    src: "/tattoos/rose-illustration-4-svgrepo-com.svg",
    alt: "Rose",
    w: 130,
    h: 130,
    className: "top-[10%] left-[5%] opacity-[0.05] -rotate-[15deg]",
  },
  {
    src: "/tattoos/bird-of-paradise-svgrepo-com.svg",
    alt: "Bird of Paradise",
    w: 100,
    h: 100,
    className: "top-[18%] right-[8%] opacity-[0.04] rotate-[8deg]",
  },
  {
    src: "/tattoos/ghost-svgrepo-com.svg",
    alt: "Ghost",
    w: 70,
    h: 70,
    className: "bottom-[22%] left-[7%] opacity-[0.045] -rotate-12",
  },
  {
    src: "/tattoos/sailor-tattoo-svgrepo-com.svg",
    alt: "Sailor Tattoo",
    w: 120,
    h: 120,
    className: "bottom-[8%] right-[5%] opacity-[0.05] rotate-[10deg]",
  },
];

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.05 4.45-3.74 4.25z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark min-h-screen flex items-center justify-center overflow-hidden">
      {/* Scattered Tattoo Decorations */}
      {loginDecorations.map((d) => (
        <div
          key={d.alt}
          className={`absolute ${d.className} hidden md:block`}
        >
          <img
            src={d.src}
            alt=""
            width={d.w}
            height={d.h}
            className="brightness-0"
          />
        </div>
      ))}

      <FilmGrainOverlay className="opacity-[0.025]" />

      {/* Drawing Canvas — desktop only */}
      <DrawingCanvas />

      {/* Center Content */}
      <div className="relative z-30 w-full max-w-[380px] mx-auto px-4 text-center pointer-events-none">
        <Eyebrow text="Welcome Back" color="red" />

        <Headline
          variant="mixed"
          words={[
            { text: "Sign", font: "pirata" },
            { text: "In", font: "rye" },
            { text: "To", font: "limelight" },
            { text: "The", font: "marker", color: "text-ink-red" },
            { text: "Scene", font: "cook" },
          ]}
        />

        <Subtitle
          text="Pick up where you left off. Your saved artists and shops are waiting."
          className="mb-8"
        />

        {/* Auth Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 pointer-events-auto"
        >
          {/* Instagram */}
          <Button
            type="button"
            variant="ink"
            size="lg"
            statusDot
            className="w-full"
          >
            Continue with Instagram
          </Button>

          {/* Google + Apple */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ink-outline"
              size="md"
              leftIcon={<GoogleIcon />}
              className="flex-1"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="ink-outline"
              size="md"
              leftIcon={<AppleIcon />}
              className="flex-1"
            >
              Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-ink-black/[0.08]" />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25">
              or
            </span>
            <div className="flex-1 h-px bg-ink-black/[0.08]" />
          </div>

          {/* Email & Password */}
          <Input
            label="Email"
            type="email"
            placeholder="artist@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {/* Sign In */}
          <Button type="submit" variant="ink" size="lg" statusDot className="w-full">
            Sign In
          </Button>

          {/* Magic Link */}
          <button
            type="button"
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/35 hover:text-ink-black/60 transition-colors cursor-pointer"
          >
            Send magic link instead &rarr;
          </button>
        </form>

        {/* Footer */}
        <p className="font-mono text-xs tracking-[0.15em] text-ink-black/30 pt-6 pointer-events-auto">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-ink-black underline hover:text-ink-black/70 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}

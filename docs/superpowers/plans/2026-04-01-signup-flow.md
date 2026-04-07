# Signup Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-step signup wizard for all three user types (Customer, Artist, Studio Owner) with deferred signup for customers, type-first selection, tailored auth, profile setup, and pricing tier selection.

**Architecture:** Next.js App Router nested layouts. `/signup/layout.tsx` provides shared visual shell (parchment gradient, film grain, decorations). Each step is a standalone client page component. No shared state between steps — each page reads context from the URL route and submits independently. Account creation on Step 2, profile updates on Steps 3-4.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, existing UI component library (Button, Input, FilmGrainOverlay, StatusDot, PricingTierCard)

**Spec:** `docs/superpowers/specs/2026-04-01-signup-flow-design.md`

---

## File Structure

```
app/signup/
  layout.tsx                    → Shared visual shell (parchment bg, film grain, decorations)
  page.tsx                      → Step 1: Type selector
  customer/
    page.tsx                    → Step 2: Customer auth (final step)
  artist/
    page.tsx                    → Step 2: Artist auth + name
    profile/
      page.tsx                  → Step 3: Styles + IG import + upload
    plan/
      page.tsx                  → Step 4: Artist pricing tier selection
  studio/
    page.tsx                    → Step 2: Studio auth + owner name
    setup/
      page.tsx                  → Step 3: Studio name + location + specialties
    plan/
      page.tsx                  → Step 4: Studio pricing tier selection

components/signup/
  index.tsx                     → Barrel export
  progress-bar.tsx              → Step progress indicator
  step-eyebrow.tsx              → Permanent Marker eyebrow text
  auth-form.tsx                 → Shared auth form (social + email/password)
  type-card.tsx                 → Clickable type selection card
  style-picker.tsx              → Multi-select pill picker (styles/specialties)
  signup-decorations.tsx        → Scattered tattoo SVG decorations
  mixed-headline.tsx            → Multi-font headline component
  ig-import-card.tsx            → Instagram import prompt card
  photo-upload-grid.tsx         → 3-slot photo upload grid
  billing-toggle.tsx            → Monthly/Annual toggle for pricing step
  signup-tier-card.tsx          → Pricing tier card adapted for signup context

lib/data/
  signup-tiers.ts               → Pricing tier data for signup (extracted from pricing page)
  signup-styles.ts              → TattooStyle display labels + studio specialties
```

---

### Task 1: Shared Layout Shell

**Files:**
- Create: `app/signup/layout.tsx`
- Create: `components/signup/signup-decorations.tsx`
- Create: `components/signup/index.tsx`

- [ ] **Step 1: Create the signup decorations component**

This extracts the scattered tattoo SVG pattern from the login page into a reusable component.

```tsx
// components/signup/signup-decorations.tsx
"use client";

import Image from "next/image";

const decorations = [
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

export function SignupDecorations() {
  return (
    <>
      {decorations.map((d) => (
        <div key={d.alt} className={`absolute ${d.className} hidden md:block`}>
          <Image
            src={d.src}
            alt=""
            width={d.w}
            height={d.h}
            className="brightness-0"
          />
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Create the shared signup layout**

```tsx
// app/signup/layout.tsx
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { DrawingCanvas } from "@/components/hero/drawing-canvas";
import { SignupDecorations } from "@/components/signup";

export const metadata = {
  title: "Sign Up | Inked Market",
  description: "Join the tattoo community. Create your account as a collector, artist, or studio owner.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative bg-gradient-to-br from-ink-parchment-light via-ink-cream to-ink-parchment-dark min-h-screen flex items-center justify-center overflow-hidden">
      <SignupDecorations />
      <FilmGrainOverlay className="opacity-[0.025]" />
      <DrawingCanvas />
      <div className="relative z-30 w-full max-w-[420px] mx-auto px-4 py-12">
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create barrel export**

```tsx
// components/signup/index.tsx
export { SignupDecorations } from "./signup-decorations";
```

- [ ] **Step 4: Verify the layout renders**

Run: `npm run dev` — navigate to `/signup`. Expect: parchment gradient, film grain, scattered SVGs on desktop, empty content area centered.

- [ ] **Step 5: Commit**

```bash
git add app/signup/layout.tsx components/signup/signup-decorations.tsx components/signup/index.tsx
git commit -m "feat: add signup shared layout shell with parchment bg and decorations"
```

---

### Task 2: Progress Bar & Step Eyebrow Components

**Files:**
- Create: `components/signup/progress-bar.tsx`
- Create: `components/signup/step-eyebrow.tsx`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the progress bar component**

```tsx
// components/signup/progress-bar.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ currentStep, totalSteps, className }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 mb-4", className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        let bg = "bg-ink-black/[0.06]"; // pending
        if (step < currentStep) bg = "bg-ink-black/25"; // done
        if (step === currentStep) bg = "bg-ink-red"; // active
        return <div key={step} className={cn("h-[3px] flex-1 rounded-full", bg)} />;
      })}
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-black/25 whitespace-nowrap">
        {currentStep} / {totalSteps}
      </span>
    </div>
  )
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
export type { ProgressBarProps };
```

- [ ] **Step 2: Create the step eyebrow component**

```tsx
// components/signup/step-eyebrow.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { permanentMarker } from "@/lib/fonts";

type EyebrowColor = "red" | "rust" | "sage";

interface StepEyebrowProps {
  text: string;
  color?: EyebrowColor;
  className?: string;
}

const colorMap: Record<EyebrowColor, string> = {
  red: "text-ink-red",
  rust: "text-ink-rust",
  sage: "text-ink-sage",
};

const StepEyebrow = React.forwardRef<HTMLParagraphElement, StepEyebrowProps>(
  ({ text, color = "red", className }, ref) => (
    <p
      ref={ref}
      className={cn(
        `${permanentMarker.className} text-xs tracking-[0.25em] uppercase -rotate-2 inline-block mb-3`,
        colorMap[color],
        className
      )}
    >
      {text}
    </p>
  )
);
StepEyebrow.displayName = "StepEyebrow";

export { StepEyebrow };
export type { StepEyebrowProps, EyebrowColor };
```

- [ ] **Step 3: Update barrel export**

```tsx
// components/signup/index.tsx
export { SignupDecorations } from "./signup-decorations";
export { ProgressBar } from "./progress-bar";
export { StepEyebrow } from "./step-eyebrow";
```

- [ ] **Step 4: Commit**

```bash
git add components/signup/progress-bar.tsx components/signup/step-eyebrow.tsx components/signup/index.tsx
git commit -m "feat: add ProgressBar and StepEyebrow signup components"
```

---

### Task 3: Type Card & Mixed Headline Components

**Files:**
- Create: `components/signup/type-card.tsx`
- Create: `components/signup/mixed-headline.tsx`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the type card component**

```tsx
// components/signup/type-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TypeCardProps {
  href: string;
  icon: React.ReactNode;
  iconColor: "sage" | "red" | "rust";
  title: string;
  description: string;
  features: string[];
  className?: string;
}

const iconBgMap: Record<string, string> = {
  sage: "bg-ink-sage/10",
  red: "bg-ink-red/[0.08]",
  rust: "bg-ink-rust/[0.08]",
};

const TypeCard = React.forwardRef<HTMLAnchorElement, TypeCardProps>(
  ({ href, icon, iconColor, title, description, features, className }, ref) => (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "flex items-center gap-4 p-[18px] rounded-2xl border border-ink-black/[0.05] bg-white",
        "transition-all duration-200 group",
        "hover:border-ink-black/[0.15]",
        className
      )}
    >
      <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0", iconBgMap[iconColor])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] font-semibold text-ink-black mb-0.5">{title}</h4>
        <p className="text-[11.5px] text-ink-black/35 leading-snug">{description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {features.map((f) => (
            <span
              key={f}
              className="font-mono text-[8.5px] uppercase tracking-[0.1em] px-2 py-1 rounded-md border border-ink-black/[0.04] bg-ink-black/[0.015] text-ink-black/30"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <span className="text-lg text-ink-black/[0.15] group-hover:text-ink-black/35 group-hover:translate-x-0.5 transition-all flex-shrink-0">
        ›
      </span>
    </Link>
  )
);
TypeCard.displayName = "TypeCard";

export { TypeCard };
export type { TypeCardProps };
```

- [ ] **Step 2: Create the mixed headline component**

This renders words in different decorative fonts, matching the login page pattern. Each word gets a font and optional color override.

```tsx
// components/signup/mixed-headline.tsx
import React from "react";
import { cn } from "@/lib/utils";
import {
  pirataOne,
  rye,
  limelight,
  permanentMarker,
  unifrakturCook,
} from "@/lib/fonts";

type FontName = "pirata" | "rye" | "limelight" | "marker" | "cook";

interface HeadlineWord {
  text: string;
  font: FontName;
  color?: string; // Tailwind color class, e.g. "text-ink-red"
}

interface MixedHeadlineProps {
  words: HeadlineWord[];
  className?: string;
}

const fontMap: Record<FontName, string> = {
  pirata: pirataOne.className,
  rye: rye.className,
  limelight: limelight.className,
  marker: permanentMarker.className,
  cook: unifrakturCook.className,
};

const MixedHeadline = React.forwardRef<HTMLHeadingElement, MixedHeadlineProps>(
  ({ words, className }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "text-[30px] sm:text-4xl text-ink-black leading-tight mb-2",
        className
      )}
    >
      <span className="flex flex-wrap items-baseline justify-center gap-x-2">
        {words.map((w, i) => (
          <span
            key={i}
            className={cn(fontMap[w.font], w.color || "text-ink-black/40")}
          >
            {w.text}
          </span>
        ))}
      </span>
    </h1>
  )
);
MixedHeadline.displayName = "MixedHeadline";

export { MixedHeadline };
export type { MixedHeadlineProps, HeadlineWord, FontName };
```

- [ ] **Step 3: Update barrel export**

Add to `components/signup/index.tsx`:
```tsx
export { TypeCard } from "./type-card";
export { MixedHeadline } from "./mixed-headline";
```

- [ ] **Step 4: Commit**

```bash
git add components/signup/type-card.tsx components/signup/mixed-headline.tsx components/signup/index.tsx
git commit -m "feat: add TypeCard and MixedHeadline signup components"
```

---

### Task 4: Step 1 — Type Selector Page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Create the type selector page**

```tsx
// app/signup/page.tsx
import Link from "next/link";
import { StepEyebrow, MixedHeadline, TypeCard } from "@/components/signup";

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-sage">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-red">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-rust">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export default function SignupPage() {
  return (
    <div className="text-center pointer-events-none">
      <div className="mb-6">
        <StepEyebrow text="Get Inked" color="red" />
      </div>

      <MixedHeadline
        words={[
          { text: "Join", font: "pirata" },
          { text: "The", font: "marker", color: "text-ink-red" },
          { text: "Scene", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-8">
        Choose your path. You can always change this later.
      </p>

      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <TypeCard
          href="/signup/customer"
          icon={<SearchIcon />}
          iconColor="sage"
          title="Tattoo Collector"
          description="Find artists, save inspo, book sessions"
          features={["Browse", "Save", "Book"]}
        />
        <TypeCard
          href="/signup/artist"
          icon={<PenIcon />}
          iconColor="red"
          title="Tattoo Artist"
          description="Showcase your portfolio, get discovered, grow your client base"
          features={["Portfolio", "Discover", "Bookings"]}
        />
        <TypeCard
          href="/signup/studio"
          icon={<HouseIcon />}
          iconColor="rust"
          title="Studio Owner"
          description="List your shop, manage artists, attract new clients"
          features={["Listing", "Team", "Analytics"]}
        />
      </div>

      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/30 pt-7 pointer-events-auto">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev` — navigate to `/signup`. Expect: Parchment background, "Get Inked" eyebrow in Permanent Marker, "Join The Scene" mixed-font headline, three type cards with icons, Sign In footer link.

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: add signup type selector page (Step 1)"
```

---

### Task 5: Auth Form Shared Component

**Files:**
- Create: `components/signup/auth-form.tsx`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the shared auth form**

This extracts the login page's auth form pattern into a reusable component with configurable fields.

```tsx
// components/signup/auth-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

interface AuthFormProps {
  nameField?: {
    label: string;
    placeholder: string;
  };
  emailPlaceholder?: string;
  ctaLabel: string;
  onBack?: string;
  className?: string;
}

export function AuthForm({
  nameField,
  emailPlaceholder = "your@email.com",
  ctaLabel,
  onBack,
  className,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth integration will go here
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {/* Social Auth */}
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

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-ink-black/[0.08]" />
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25">or</span>
        <div className="flex-1 h-px bg-ink-black/[0.08]" />
      </div>

      {/* Email & Password */}
      <Input
        label="Email"
        type="email"
        placeholder={emailPlaceholder}
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
        autoComplete="new-password"
      />

      {/* Optional Name Field */}
      {nameField && (
        <Input
          label={nameField.label}
          type="text"
          placeholder={nameField.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      )}

      {/* Submit */}
      <Button type="submit" variant="ink" size="lg" statusDot className="w-full">
        {ctaLabel}
      </Button>

      {/* Magic Link */}
      <button
        type="button"
        className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/35 hover:text-ink-black/60 transition-colors cursor-pointer"
      >
        Send magic link instead &rarr;
      </button>

      {/* Back */}
      {onBack && (
        <Link
          href={onBack}
          className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-1"
        >
          &larr; Back
        </Link>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Update barrel export**

Add to `components/signup/index.tsx`:
```tsx
export { AuthForm } from "./auth-form";
```

- [ ] **Step 3: Commit**

```bash
git add components/signup/auth-form.tsx components/signup/index.tsx
git commit -m "feat: add AuthForm shared component for signup"
```

---

### Task 6: Step 2 — Customer, Artist, and Studio Auth Pages

**Files:**
- Create: `app/signup/customer/page.tsx`
- Create: `app/signup/artist/page.tsx`
- Create: `app/signup/studio/page.tsx`

- [ ] **Step 1: Create customer auth page**

```tsx
// app/signup/customer/page.tsx
import Link from "next/link";
import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function CustomerSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={2} />

      <div className="mb-5">
        <StepEyebrow text="Almost There" color="sage" />
      </div>

      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "rye" },
          { text: "Account", font: "cook", color: "text-ink-sage" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Sign up to save artists, get recommendations, and book sessions.
      </p>

      <AuthForm
        emailPlaceholder="your@email.com"
        ctaLabel="Create Account"
        onBack="/signup"
      />

      <p className="font-mono text-xs tracking-[0.15em] text-ink-black/25 pt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-black underline hover:text-ink-black/70 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create artist auth page**

```tsx
// app/signup/artist/page.tsx
import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function ArtistSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Artist Account" color="red" />
      </div>

      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Account", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Set up your artist profile and start getting discovered.
      </p>

      <AuthForm
        emailPlaceholder="artist@studio.com"
        nameField={{ label: "Artist Name", placeholder: "Your display name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create studio auth page**

```tsx
// app/signup/studio/page.tsx
import { ProgressBar, StepEyebrow, MixedHeadline, AuthForm } from "@/components/signup";

export default function StudioSignupPage() {
  return (
    <div className="text-center">
      <ProgressBar currentStep={2} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Studio Account" color="rust" />
      </div>

      <MixedHeadline
        words={[
          { text: "Create", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-rust" },
          { text: "Account", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Set up your studio&apos;s presence on Inked Market.
      </p>

      <AuthForm
        emailPlaceholder="owner@studio.com"
        nameField={{ label: "Your Name", placeholder: "Studio owner name" }}
        ctaLabel="Continue"
        onBack="/signup"
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify all three auth pages**

Run: `npm run dev`. Navigate to `/signup/customer`, `/signup/artist`, `/signup/studio`. Verify:
- Correct progress bars (2/2 customer, 2/4 artist, 2/4 studio)
- Correct eyebrow colors (sage, red, rust)
- Correct headline accent colors
- Customer has no name field; artist and studio have name fields with different labels

- [ ] **Step 5: Commit**

```bash
git add app/signup/customer/page.tsx app/signup/artist/page.tsx app/signup/studio/page.tsx
git commit -m "feat: add auth pages for customer, artist, and studio signup"
```

---

### Task 7: Style Picker Component

**Files:**
- Create: `components/signup/style-picker.tsx`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the style picker**

```tsx
// components/signup/style-picker.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AccentColor = "red" | "rust" | "sage";

interface StylePickerProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor?: AccentColor;
  className?: string;
}

const selectedStyles: Record<AccentColor, string> = {
  red: "border-ink-red bg-ink-red/[0.05] text-ink-red opacity-100",
  rust: "border-ink-rust bg-ink-rust/[0.05] text-ink-rust opacity-100",
  sage: "border-ink-sage bg-ink-sage/[0.05] text-ink-sage opacity-100",
};

export function StylePicker({ options, selected, onChange, accentColor = "red", className }: StylePickerProps) {
  const toggle = (style: string) => {
    if (selected.includes(style)) {
      onChange(selected.filter((s) => s !== style));
    } else {
      onChange([...selected, style]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((style) => {
        const isSelected = selected.includes(style);
        return (
          <button
            key={style}
            type="button"
            onClick={() => toggle(style)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.12em] px-[15px] py-[9px] rounded-full",
              "border border-ink-black/[0.06] bg-ink-black/[0.015] text-ink-black opacity-[0.45]",
              "transition-all duration-200 cursor-pointer",
              "hover:opacity-[0.65] hover:border-ink-black/[0.12]",
              isSelected && selectedStyles[accentColor]
            )}
          >
            {style}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update barrel export**

Add to `components/signup/index.tsx`:
```tsx
export { StylePicker } from "./style-picker";
```

- [ ] **Step 3: Commit**

```bash
git add components/signup/style-picker.tsx components/signup/index.tsx
git commit -m "feat: add StylePicker multi-select pill component"
```

---

### Task 8: IG Import Card & Photo Upload Grid

**Files:**
- Create: `components/signup/ig-import-card.tsx`
- Create: `components/signup/photo-upload-grid.tsx`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the IG import card**

```tsx
// components/signup/ig-import-card.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IgImportCardProps {
  onConnect?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function IgImportCard({ onConnect, onSkip, className }: IgImportCardProps) {
  return (
    <div className={cn("rounded-[18px] border border-ink-black/[0.05] bg-white p-[22px] text-center", className)}>
      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center mx-auto mb-3.5 shadow-[0_4px_16px_rgba(253,29,29,0.2)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
        </svg>
      </div>
      <h4 className="text-[15px] font-semibold text-ink-black mb-1">Import from Instagram</h4>
      <p className="text-xs text-ink-black/30 mb-4 leading-relaxed">
        Connect your IG to instantly populate your portfolio with your best work.
      </p>
      <button
        type="button"
        onClick={onConnect}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink-black text-ink-cream font-mono text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-ink-black/90 transition-colors"
      >
        <span className="w-[5px] h-[5px] rounded-full bg-ink-red shadow-[0_0_6px_rgba(255,51,51,0.4)]" />
        Connect Instagram
      </button>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="block w-full text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-black/20 hover:text-ink-black/40 transition-colors cursor-pointer mt-3"
        >
          Skip for now &rarr;
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the photo upload grid**

```tsx
// components/signup/photo-upload-grid.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PhotoUploadGridProps {
  slots?: number;
  className?: string;
}

export function PhotoUploadGrid({ slots = 3, className }: PhotoUploadGridProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {Array.from({ length: slots }, (_, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            "aspect-square rounded-[14px] border-[1.5px] border-dashed border-ink-black/[0.1] bg-ink-black/[0.015]",
            "flex flex-col items-center justify-center gap-1 cursor-pointer",
            "hover:border-ink-black/[0.2] hover:bg-ink-black/[0.03] transition-all",
            i === 0 ? "opacity-100" : "opacity-50"
          )}
        >
          <span className={cn("text-[22px] font-light text-ink-black", i === 0 ? "opacity-30" : "opacity-15")}>+</span>
          {i === 0 && (
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-black/30">Upload</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update barrel export**

Add to `components/signup/index.tsx`:
```tsx
export { IgImportCard } from "./ig-import-card";
export { PhotoUploadGrid } from "./photo-upload-grid";
```

- [ ] **Step 4: Commit**

```bash
git add components/signup/ig-import-card.tsx components/signup/photo-upload-grid.tsx components/signup/index.tsx
git commit -m "feat: add IgImportCard and PhotoUploadGrid signup components"
```

---

### Task 9: Step 3 — Artist Profile Page

**Files:**
- Create: `app/signup/artist/profile/page.tsx`
- Create: `lib/data/signup-styles.ts`

- [ ] **Step 1: Create the style data file**

```tsx
// lib/data/signup-styles.ts
import type { TattooStyle } from "@/lib/types";

export const tattooStyleLabels: Record<TattooStyle, string> = {
  "fine-line": "Fine Line",
  minimalist: "Minimalist",
  traditional: "Traditional",
  "neo-traditional": "Neo-Trad",
  japanese: "Japanese",
  blackwork: "Blackwork",
  realism: "Realism",
  watercolor: "Watercolor",
  geometric: "Geometric",
  portrait: "Portrait",
  dotwork: "Dotwork",
  tribal: "Tribal",
  sketch: "Sketch",
  abstract: "Abstract",
  other: "Other",
};

export const tattooStyleOptions = Object.values(tattooStyleLabels);

export const studioSpecialtyOptions = [
  "Traditional",
  "Realism",
  "Fine Line",
  "Japanese",
  "Blackwork",
  "Color Work",
  "Custom Design",
  "Cover-Ups",
  "Walk-Ins",
  "Piercing",
];
```

- [ ] **Step 2: Create the artist profile page**

```tsx
// app/signup/artist/profile/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProgressBar,
  StepEyebrow,
  MixedHeadline,
  StylePicker,
  IgImportCard,
  PhotoUploadGrid,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { tattooStyleOptions } from "@/lib/data/signup-styles";

export default function ArtistProfilePage() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const handleComplete = () => {
    window.location.href = "/signup/artist/plan";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={3} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Almost There" color="red" />
      </div>

      <MixedHeadline
        words={[
          { text: "Show", font: "limelight" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Work", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Pick your styles and add some portfolio work. You can always add more later from your dashboard.
      </p>

      {/* Styles */}
      <div className="text-left mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/25 mb-2 px-1">
          Your Styles
        </p>
        <StylePicker
          options={tattooStyleOptions}
          selected={selectedStyles}
          onChange={setSelectedStyles}
          accentColor="red"
        />
      </div>

      {/* IG Import */}
      <IgImportCard
        onConnect={() => {/* IG OAuth */}}
        onSkip={() => {}}
        className="mb-4"
      />

      {/* Manual Upload */}
      <div className="text-left mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/25 mb-2 px-1">
          Or Upload Photos
        </p>
        <PhotoUploadGrid />
      </div>

      {/* CTA */}
      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleComplete}
        disabled={selectedStyles.length === 0}
      >
        Complete Setup
      </Button>

      <Link
        href="/signup/artist"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/signup/artist/profile`. Expect: Progress bar 3/4, "Almost There" red eyebrow, "Show Your Work" headline, style pills, IG import card, photo upload grid, disabled CTA until at least 1 style selected.

- [ ] **Step 4: Commit**

```bash
git add lib/data/signup-styles.ts app/signup/artist/profile/page.tsx
git commit -m "feat: add artist profile setup page (Step 3) with styles, IG import, and photo upload"
```

---

### Task 10: Step 3 — Studio Setup Page

**Files:**
- Create: `app/signup/studio/setup/page.tsx`

- [ ] **Step 1: Create the studio setup page**

```tsx
// app/signup/studio/setup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProgressBar,
  StepEyebrow,
  MixedHeadline,
  StylePicker,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";

export default function StudioSetupPage() {
  const [studioName, setStudioName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const isValid = studioName.trim() && city.trim() && state.trim() && specialties.length > 0;

  const handleComplete = () => {
    window.location.href = "/signup/studio/plan";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={3} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Almost There" color="rust" />
      </div>

      <MixedHeadline
        words={[
          { text: "Set", font: "pirata" },
          { text: "Up", font: "rye" },
          { text: "Your", font: "marker", color: "text-ink-rust" },
          { text: "Studio", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-6">
        Create your studio&apos;s listing or claim an existing one. Takes under 5 minutes.
      </p>

      {/* Claim / Create toggle */}
      <div className="flex gap-2.5 mb-5">
        <div className="flex-1 p-4 rounded-[14px] border border-ink-rust bg-ink-rust/[0.03] text-center">
          <div className="text-2xl mb-1.5">✨</div>
          <h4 className="text-[13px] font-semibold text-ink-black mb-0.5">New Listing</h4>
          <p className="text-[10px] text-ink-black/30">Create from scratch</p>
        </div>
        <div className="flex-1 p-4 rounded-[14px] border border-ink-black/[0.05] bg-white text-center opacity-60">
          <div className="text-2xl mb-1.5">🔍</div>
          <h4 className="text-[13px] font-semibold text-ink-black mb-0.5">Claim Existing</h4>
          <p className="text-[10px] text-ink-black/30">Find your shop</p>
          <span className="inline-block mt-1.5 font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-rust/[0.08] text-ink-rust border border-ink-rust/[0.15]">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-2.5 text-left mb-5">
        <Input
          label="Studio Name"
          type="text"
          placeholder="Ink Paradise Studio"
          value={studioName}
          onChange={(e) => setStudioName(e.target.value)}
        />
        <div className="flex gap-2.5">
          <div className="flex-[2]">
            <Input
              label="City"
              type="text"
              placeholder="Los Angeles"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="State"
              type="text"
              placeholder="CA"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>
        <Input
          label="Phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Specialties */}
      <div className="text-left mb-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-black/25 mb-2 px-1">
          Studio Specialties
        </p>
        <StylePicker
          options={studioSpecialtyOptions}
          selected={specialties}
          onChange={setSpecialties}
          accentColor="rust"
        />
      </div>

      {/* CTA */}
      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleComplete}
        disabled={!isValid}
      >
        Complete Setup
      </Button>

      <Link
        href="/signup/studio"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/signup/studio/setup`. Expect: Progress 3/4, rust eyebrow, "Set Up Your Studio" headline, new/claim toggle (claim disabled with Coming Soon badge), form inputs, specialty pills, CTA disabled until name+city+state+1 specialty filled.

- [ ] **Step 3: Commit**

```bash
git add app/signup/studio/setup/page.tsx
git commit -m "feat: add studio setup page (Step 3) with claim toggle, location, and specialties"
```

---

### Task 11: Billing Toggle & Signup Tier Card Components

**Files:**
- Create: `components/signup/billing-toggle.tsx`
- Create: `components/signup/signup-tier-card.tsx`
- Create: `lib/data/signup-tiers.ts`
- Modify: `components/signup/index.tsx`

- [ ] **Step 1: Create the billing toggle**

```tsx
// components/signup/billing-toggle.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BillingToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
  className?: string;
}

export function BillingToggle({ isAnnual, onChange, className }: BillingToggleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black cursor-pointer transition-opacity",
          !isAnnual ? "opacity-80 font-semibold" : "opacity-30"
        )}
        onClick={() => onChange(false)}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={() => onChange(!isAnnual)}
        className={cn(
          "w-10 h-[22px] rounded-full relative transition-colors cursor-pointer",
          isAnnual ? "bg-ink-sage" : "bg-ink-black/10"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform",
            isAnnual && "translate-x-[18px]"
          )}
        />
      </button>
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-black cursor-pointer transition-opacity",
          isAnnual ? "opacity-80 font-semibold" : "opacity-30"
        )}
        onClick={() => onChange(true)}
      >
        Annual
      </span>
      <span className="font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-sage/10 text-ink-sage border border-ink-sage/20">
        Save 20%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create the signup tier card**

```tsx
// components/signup/signup-tier-card.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TierFeature {
  text: string;
  included: boolean;
}

interface SignupTierCardProps {
  name: string;
  price: number;
  annualPrice?: number;
  isAnnual: boolean;
  description: string;
  features: TierFeature[];
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  badgeColor?: "red" | "rust" | "sage";
  freeBadge?: boolean;
  accentColor?: "red" | "rust";
  className?: string;
}

const badgeBgMap: Record<string, string> = {
  red: "bg-ink-red",
  rust: "bg-ink-rust",
  sage: "bg-ink-sage",
};

const selectedBorderMap: Record<string, string> = {
  red: "border-ink-red bg-ink-red/[0.02]",
  rust: "border-ink-rust bg-ink-rust/[0.02]",
};

export function SignupTierCard({
  name,
  price,
  annualPrice,
  isAnnual,
  description,
  features,
  selected,
  onSelect,
  badge,
  badgeColor = "red",
  freeBadge,
  accentColor = "red",
  className,
}: SignupTierCardProps) {
  const displayPrice = isAnnual && annualPrice ? annualPrice : price;
  const isFree = price === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full p-5 rounded-[18px] border border-ink-black/[0.05] bg-white text-left transition-all cursor-pointer relative",
        "hover:border-ink-black/[0.12]",
        selected && selectedBorderMap[accentColor],
        className
      )}
    >
      {badge && (
        <span className={cn("absolute -top-2 right-4 font-mono text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full text-white", badgeBgMap[badgeColor])}>
          {badge}
        </span>
      )}

      <div className="flex justify-between items-start mb-2.5">
        <div>
          {freeBadge && (
            <span className="inline-block font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-sage/[0.08] text-ink-sage border border-ink-sage/[0.12] mb-2">
              No Card Required
            </span>
          )}
          <div className="text-base font-bold text-ink-black">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-bold text-ink-black leading-none">
            {isFree ? "$0" : (
              <>
                ${Math.floor(displayPrice)}
                <span className="text-sm opacity-50">.{(displayPrice % 1).toFixed(2).slice(2)}</span>
              </>
            )}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-black/25">
            {isFree ? "forever" : "/ month"}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-black/35 mb-3 leading-relaxed">{description}</p>

      <div className="flex flex-col gap-1.5">
        {features.map((f) => (
          <div key={f.text} className="flex items-center gap-2 text-xs text-ink-black/50">
            {f.included ? (
              <span className="text-ink-sage font-semibold text-sm">✓</span>
            ) : (
              <span className="text-ink-black/20 text-sm">—</span>
            )}
            <span className={cn(!f.included && "opacity-50")}>{f.text}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Create the tier data file**

```tsx
// lib/data/signup-tiers.ts
export interface SignupTierFeature {
  text: string;
  included: boolean;
}

export interface SignupTierData {
  name: string;
  price: number;
  annualPrice?: number;
  description: string;
  features: SignupTierFeature[];
  badge?: string;
  badgeColor?: "red" | "rust" | "sage";
  freeBadge?: boolean;
}

export const artistTiers: SignupTierData[] = [
  {
    name: "Free",
    price: 0,
    description: "Manage your profile and gallery on your studio\u2019s page.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery on studio page", included: true },
      { text: "Independent listing on Discover", included: false },
      { text: "Own artist profile page", included: false },
    ],
    freeBadge: true,
  },
  {
    name: "Pro",
    price: 14.85,
    annualPrice: 11.85,
    description: "Go independent. Get discovered on your own terms \u2014 no studio required.",
    features: [
      { text: "Profile & gallery management", included: true },
      { text: "Gallery on studio page", included: true },
      { text: "Public listing on Discover", included: true },
      { text: "Independent artist profile", included: true },
      { text: "No studio required", included: true },
    ],
    badge: "Popular",
    badgeColor: "red",
  },
];

export const studioTiers: SignupTierData[] = [
  {
    name: "Basic",
    price: 19.85,
    annualPrice: 15.85,
    description: "A professional listing on the Inked Market marketplace.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: false },
      { text: "Premium templates", included: false },
    ],
  },
  {
    name: "Pro",
    price: 59.85,
    annualPrice: 47.85,
    description: "Custom web page with full branding control.",
    features: [
      { text: "Profile-style listing", included: true },
      { text: "Discover marketplace presence", included: true },
      { text: "Custom web page", included: true },
      { text: "Customize colors, fonts & content", included: true },
      { text: "Premium templates", included: false },
    ],
    badge: "Popular",
    badgeColor: "rust",
  },
  {
    name: "Studio",
    price: 79.85,
    annualPrice: 63.85,
    description: "Everything in Pro plus premium templates and priority search placement.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Rearrange layout sections", included: true },
      { text: "Exclusive premium templates", included: true },
      { text: "Priority search placement", included: true },
    ],
  },
];
```

- [ ] **Step 4: Update barrel export**

Add to `components/signup/index.tsx`:
```tsx
export { BillingToggle } from "./billing-toggle";
export { SignupTierCard } from "./signup-tier-card";
```

- [ ] **Step 5: Commit**

```bash
git add components/signup/billing-toggle.tsx components/signup/signup-tier-card.tsx lib/data/signup-tiers.ts components/signup/index.tsx
git commit -m "feat: add BillingToggle, SignupTierCard, and tier data for pricing step"
```

---

### Task 12: Step 4 — Artist and Studio Pricing Pages

**Files:**
- Create: `app/signup/artist/plan/page.tsx`
- Create: `app/signup/studio/plan/page.tsx`

- [ ] **Step 1: Create artist pricing page**

```tsx
// app/signup/artist/plan/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProgressBar,
  StepEyebrow,
  MixedHeadline,
  BillingToggle,
  SignupTierCard,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { artistTiers } from "@/lib/data/signup-tiers";

export default function ArtistPlanPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Free");

  const handleActivate = () => {
    if (selectedTier === "Free") {
      // Mark account active, redirect to dashboard
      window.location.href = "/";
    } else {
      // Redirect to Stripe checkout
      window.location.href = "/";
    }
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Last Step" color="red" />
      </div>

      <MixedHeadline
        words={[
          { text: "Choose", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-red" },
          { text: "Plan", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-5">
        Start free or go Pro for independent visibility. Upgrade anytime.
      </p>

      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} className="mb-5" />

      <div className="flex flex-col gap-2.5 mb-5">
        {artistTiers.map((tier) => (
          <SignupTierCard
            key={tier.name}
            name={tier.name}
            price={tier.price}
            annualPrice={tier.annualPrice}
            isAnnual={isAnnual}
            description={tier.description}
            features={tier.features}
            selected={selectedTier === tier.name}
            onSelect={() => setSelectedTier(tier.name)}
            badge={tier.badge}
            badgeColor={tier.badgeColor}
            freeBadge={tier.freeBadge}
            accentColor="red"
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleActivate}
      >
        Activate Account
      </Button>

      <Link
        href="/signup/artist/profile"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create studio pricing page**

```tsx
// app/signup/studio/plan/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProgressBar,
  StepEyebrow,
  MixedHeadline,
  BillingToggle,
  SignupTierCard,
} from "@/components/signup";
import { Button } from "@/components/ui/button";
import { studioTiers } from "@/lib/data/signup-tiers";

export default function StudioPlanPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Basic");

  const handleActivate = () => {
    // Redirect to Stripe checkout
    window.location.href = "/";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className="mb-5">
        <StepEyebrow text="Last Step" color="rust" />
      </div>

      <MixedHeadline
        words={[
          { text: "Choose", font: "pirata" },
          { text: "Your", font: "marker", color: "text-ink-rust" },
          { text: "Plan", font: "cook" },
        ]}
      />

      <p className="text-sm text-ink-black/35 leading-relaxed mb-5">
        All plans include a marketplace presence. Upgrade for full customization.
      </p>

      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} className="mb-5" />

      <div className="flex flex-col gap-2.5 mb-5">
        {studioTiers.map((tier) => (
          <SignupTierCard
            key={tier.name}
            name={tier.name}
            price={tier.price}
            annualPrice={tier.annualPrice}
            isAnnual={isAnnual}
            description={tier.description}
            features={tier.features}
            selected={selectedTier === tier.name}
            onSelect={() => setSelectedTier(tier.name)}
            badge={tier.badge}
            badgeColor={tier.badgeColor}
            accentColor="rust"
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ink"
        size="lg"
        statusDot
        className="w-full"
        onClick={handleActivate}
      >
        Activate Studio
      </Button>

      <Link
        href="/signup/studio/setup"
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Verify all pricing pages**

Navigate to `/signup/artist/plan` and `/signup/studio/plan`. Verify:
- Artist: 2 tier cards (Free pre-selected, Pro with Popular badge), billing toggle, "Activate Account" CTA
- Studio: 3 tier cards (Basic pre-selected, Pro with Popular badge), billing toggle, "Activate Studio" CTA
- Billing toggle switches price displays
- Progress bar shows 4/4

- [ ] **Step 4: Commit**

```bash
git add app/signup/artist/plan/page.tsx app/signup/studio/plan/page.tsx
git commit -m "feat: add pricing tier selection pages for artist and studio (Step 4)"
```

---

### Task 13: Wire Up Navigation — "Get Started" Button

**Files:**
- Modify: `components/layout/navigation.tsx` (ONLY the href on "Get Started" — do NOT change button styling, size, or behavior per feedback_header_buttons.md)

- [ ] **Step 1: Update "Get Started" href**

In `components/layout/navigation.tsx`, find the "Get Started" buttons (both desktop and mobile) and update their `href` from `"#"` to `"/signup"`.

**Desktop button (look for the desktop auth pill area):**
Change `href="#"` to `href="/signup"` on the `<Button as={Link}>` with text "Get Started".

**Mobile button (look for the mobile menu area):**
Change `href="#"` to `href="/signup"` on the mobile `<Button as={Link}>` with text "Get Started".

Do NOT change any styling, variant, size, or other props on these buttons.

- [ ] **Step 2: Verify navigation**

Click "Get Started" in the nav → should navigate to `/signup`. Click type cards → should navigate to the correct auth pages.

- [ ] **Step 3: Commit**

```bash
git add components/layout/navigation.tsx
git commit -m "feat: wire Get Started button to /signup route"
```

---

### Task 14: Full Flow Verification & Build Check

- [ ] **Step 1: Test complete customer flow**

Navigate: `/signup` → Click "Tattoo Collector" → `/signup/customer` (2/2 progress, no name field, "Create Account" CTA)

- [ ] **Step 2: Test complete artist flow**

Navigate: `/signup` → Click "Tattoo Artist" → `/signup/artist` (2/4 progress, "Artist Name" field) → Navigate to `/signup/artist/profile` (3/4 progress, styles + IG + upload) → Select styles → Navigate to `/signup/artist/plan` (4/4 progress, Free/Pro tiers)

- [ ] **Step 3: Test complete studio flow**

Navigate: `/signup` → Click "Studio Owner" → `/signup/studio` (2/4 progress, "Your Name" field) → Navigate to `/signup/studio/setup` (3/4 progress, new/claim toggle, form fields, specialties) → Fill form → Navigate to `/signup/studio/plan` (4/4 progress, 3 tier cards)

- [ ] **Step 4: Test mobile responsiveness**

Open Chrome DevTools → Toggle device toolbar → 375px width. Verify all steps fit viewport, no horizontal scroll, touch targets adequate.

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: No lint errors in new files.

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: fix any build/lint issues from signup flow"
```

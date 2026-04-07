"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Headline } from "@/components/ui/headline";
import { Subtitle } from "@/components/ui/subtitle";
import { ProgressBar, StylePicker } from "@/components/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studioSpecialtyOptions } from "@/lib/data/signup-styles";

export default function StudioSetupPage() {
  const { updateSignupProgress, completeSignup, signupProgress } = useAuth();
  const [studioName, setStudioName] = useState(signupProgress.studioName || "");
  const [city, setCity] = useState(signupProgress.city || "");
  const [state, setState] = useState(signupProgress.state || "");
  const [phone, setPhone] = useState(signupProgress.phone || "");
  const [specialties, setSpecialties] = useState<string[]>(signupProgress.specialties || []);

  const isValid = studioName.trim() && city.trim() && state.trim() && specialties.length > 0;

  const handleComplete = () => {
    updateSignupProgress({
      studioName,
      city,
      state,
      phone,
      specialties,
    });
    completeSignup();
    window.location.href = "/dashboard";
  };

  return (
    <div className="text-center">
      <ProgressBar currentStep={3} totalSteps={3} />

      <Eyebrow text="Almost There" color="rust" />
      <Headline
        variant="mixed"
        size="sm"
        words={[
          { text: "Set", font: "pirata" },
          { text: "Up", font: "rye" },
          { text: "Your", font: "limelight" },
          { text: "Studio", font: "cook", color: "text-ink-rust" },
        ]}
      />
      <Subtitle text="Create your studio's listing or claim an existing one. Takes under 5 minutes." className="mb-6" />

      <div className="flex gap-2.5 mb-5">
        <div className="flex-1 p-4 rounded-[14px] border border-ink-rust bg-ink-rust/[0.03] text-center">
          <div className="flex justify-center mb-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-rust">
              <path d="M12 5v14M5 12h14" /><rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <h4 className="text-[13px] font-semibold text-ink-black mb-0.5">New Listing</h4>
          <p className="text-[10px] text-ink-black/30">Create from scratch</p>
        </div>
        <div className="flex-1 p-4 rounded-[14px] border border-ink-black/[0.05] bg-white text-center opacity-60">
          <div className="flex justify-center mb-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-black/40">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h4 className="text-[13px] font-semibold text-ink-black mb-0.5">Claim Existing</h4>
          <p className="text-[10px] text-ink-black/30">Find your studio</p>
          <span className="inline-block mt-1.5 font-mono text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-ink-rust/[0.08] text-ink-rust border border-ink-rust/[0.15]">
            Coming Soon
          </span>
        </div>
      </div>

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
        onClick={() => updateSignupProgress({ studioName, city, state, phone, specialties })}
        className="block text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink-black/25 hover:text-ink-black/45 transition-colors pt-3"
      >
        &larr; Back
      </Link>
    </div>
  );
}

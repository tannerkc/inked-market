import React from "react";
import type { TemplateDefinition } from "@/lib/types/builder";
import { StarIcon } from "@/components/ui/star-rating";

interface TemplatePreviewProps {
  template: TemplateDefinition;
}

// SVG tattoo pattern data URIs
const darkPatternSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5l3 8h8l-6.5 5 2.5 8L30 21l-7 5 2.5-8L19 13h8z' fill='%23ffffff' fill-opacity='0.08'/%3E%3Cpath d='M10 40l2 5h5l-4 3 1.5 5-4.5-3.5-4.5 3.5 1.5-5-4-3h5z' fill='%23ffffff' fill-opacity='0.05'/%3E%3Cpath d='M50 45l1.5 4h4l-3 2.5 1 4-3.5-2.5-3.5 2.5 1-4-3-2.5h4z' fill='%23ffffff' fill-opacity='0.06'/%3E%3C/svg%3E")`;

const lightPatternSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5l3 8h8l-6.5 5 2.5 8L30 21l-7 5 2.5-8L19 13h8z' fill='%23000000' fill-opacity='0.06'/%3E%3Cpath d='M10 40l2 5h5l-4 3 1.5 5-4.5-3.5-4.5 3.5 1.5-5-4-3h5z' fill='%23000000' fill-opacity='0.04'/%3E%3Cpath d='M50 45l1.5 4h4l-3 2.5 1 4-3.5-2.5-3.5 2.5 1-4-3-2.5h4z' fill='%23000000' fill-opacity='0.05'/%3E%3C/svg%3E")`;

function DarkImagePlaceholder({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%)",
        backgroundImage: darkPatternSvg,
        backgroundSize: "60px 60px",
        ...style,
      }}
    />
  );
}

function LightImagePlaceholder({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, #e0dbd6 0%, #d5d0cb 50%, #e0dbd6 100%)",
        backgroundImage: lightPatternSvg,
        backgroundSize: "60px 60px",
        ...style,
      }}
    />
  );
}

function WarmImagePlaceholder({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, #d8cfc5 0%, #cec5bb 50%, #d8cfc5 100%)",
        backgroundImage: lightPatternSvg,
        backgroundSize: "60px 60px",
        ...style,
      }}
    />
  );
}

// ── Bold Editorial ──────────────────────────────────────────────

function BoldEditorialPreview() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#0A0A0A", fontFamily: "'Inter', sans-serif", minHeight: 600 }}
    >
      {/* Split Hero */}
      <div className="flex" style={{ height: 260 }}>
        {/* Image side */}
        <DarkImagePlaceholder className="w-1/2 relative" style={{ background: "linear-gradient(135deg, #141414 0%, #1e1e1e 50%, #141414 100%)" }} />
        {/* Text side */}
        <div className="w-1/2 flex flex-col justify-center px-6 py-5">
          <span
            className="text-[9px] uppercase tracking-widest mb-3"
            style={{ color: "#555" }}
          >
            Portland, OR
          </span>
          <h1
            className="text-[42px] leading-[0.9] font-bold uppercase tracking-tight mb-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#ffffff" }}
          >
            IRON &<br />INK
          </h1>
          <p className="text-[10px] mb-4" style={{ color: "#FF3333" }}>
            Tattoo crafted with intention.
          </p>
          <div>
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-sm"
              style={{ backgroundColor: "#FF3333", color: "#fff" }}
            >
              Book a Consultation
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Strip */}
      <div className="px-4 py-4">
        <div className="flex gap-2" style={{ height: 100 }}>
          <DarkImagePlaceholder className="rounded-sm" style={{ flex: "2 1 0%" }} />
          <DarkImagePlaceholder className="rounded-sm" style={{ flex: "1 1 0%" }} />
          <DarkImagePlaceholder className="rounded-sm" style={{ flex: "1 1 0%" }} />
          <DarkImagePlaceholder className="rounded-sm" style={{ flex: "1 1 0%" }} />
        </div>
      </div>

      {/* Three Column Info Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Reviews */}
          <div className="rounded-sm p-3" style={{ backgroundColor: "#111" }}>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#FF3333" }}>
                Reviews
              </span>
            </div>
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[16px] font-bold" style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif" }}>
                4.9
              </span>
              <div className="flex gap-0.5 text-[#FF3333]">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-2.5 h-2.5" />
                ))}
              </div>
            </div>
            <p className="text-[8px] leading-snug" style={{ color: "#666" }}>
              &ldquo;Absolutely incredible work. Best studio in the city.&rdquo;
            </p>
            <p className="text-[7px] mt-1" style={{ color: "#444" }}>— Sarah M.</p>
          </div>

          {/* Hours */}
          <div className="rounded-sm p-3" style={{ backgroundColor: "#111" }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block mb-2" style={{ color: "#FF3333" }}>
              Hours
            </span>
            <div className="space-y-1">
              {[
                ["Mon–Fri", "11am–8pm"],
                ["Saturday", "10am–6pm"],
                ["Sunday", "Closed"],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-[8px]" style={{ color: "#888" }}>{day}</span>
                  <span className="text-[8px] font-medium" style={{ color: "#ccc" }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="rounded-sm p-3" style={{ backgroundColor: "#111" }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block mb-2" style={{ color: "#FF3333" }}>
              Artists
            </span>
            <div className="space-y-1.5">
              {["Marco Reyes", "Ava Chen", "D. Kowalski"].map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: "#222", border: "1px solid #333" }}
                  />
                  <span className="text-[8px] font-medium" style={{ color: "#ccc" }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer glow line */}
      <div className="px-4 pb-3">
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #FF3333, transparent)" }} />
        <div className="flex justify-between items-center pt-2">
          <span className="text-[7px] uppercase tracking-widest" style={{ color: "#333" }}>
            Portland, OR
          </span>
          <span className="text-[7px] uppercase tracking-widest" style={{ color: "#333" }}>
            Est. 2018
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Clean Minimal ───────────────────────────────────────────────

function CleanMinimalPreview() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#fafafa", fontFamily: "'Space Grotesk', sans-serif", minHeight: 600 }}
    >
      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #e5e5e5" }}
      >
        <span className="text-[11px] font-semibold tracking-tight" style={{ color: "#1a1a1a" }}>
          Iron & Ink
        </span>
        <div className="flex items-center gap-4">
          {["Work", "Artists", "About", "Contact"].map((item) => (
            <span key={item} className="text-[9px]" style={{ color: "#666" }}>
              {item}
            </span>
          ))}
          <span
            className="text-[9px] font-medium px-3 py-1 rounded-sm"
            style={{ backgroundColor: "#1a1a1a", color: "#fafafa" }}
          >
            Book Now
          </span>
        </div>
      </div>

      {/* Large text hero */}
      <div className="px-6 pt-12 pb-8">
        <span
          className="text-[9px] uppercase tracking-widest mb-3 block"
          style={{ color: "#999" }}
        >
          Portland, OR
        </span>
        <h1
          className="text-[48px] font-medium leading-[1] tracking-tight mb-2"
          style={{ color: "#1a1a1a", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Iron & Ink<br />Studio
        </h1>
        <p className="text-[11px] mb-5" style={{ color: "#888" }}>
          Modern tattoo, timeless craft.
        </p>
        <span
          className="text-[9px] font-medium px-4 py-2 rounded-sm"
          style={{ backgroundColor: "#1a1a1a", color: "#fafafa" }}
        >
          Book a Consultation
        </span>
      </div>

      {/* 3-column gallery */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[...Array(3)].map((_, i) => (
            <LightImagePlaceholder
              key={i}
              className="rounded-lg aspect-[4/5]"
            />
          ))}
        </div>
      </div>

      {/* 2-column info */}
      <div className="px-6 pb-5 grid grid-cols-2 gap-4">
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#1a1a1a" }}>
            Hours
          </span>
          <div className="space-y-1">
            {[
              ["Mon–Fri", "11am – 8pm"],
              ["Saturday", "10am – 6pm"],
              ["Sunday", "Closed"],
            ].map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="text-[8px]" style={{ color: "#999" }}>{day}</span>
                <span className="text-[8px]" style={{ color: "#555" }}>{hours}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-wider block mb-2" style={{ color: "#1a1a1a" }}>
            Location
          </span>
          <p className="text-[9px] leading-relaxed" style={{ color: "#666" }}>
            742 SE Division St<br />Portland, OR 97202
          </p>
          <p className="text-[8px] mt-2" style={{ color: "#999" }}>
            Walk-ins welcome · Free parking
          </p>
        </div>
      </div>

      {/* Minimal footer */}
      <div className="px-6 py-3" style={{ borderTop: "1px solid #e5e5e5" }}>
        <div className="flex justify-between items-center">
          <span className="text-[8px]" style={{ color: "#bbb" }}>© 2024 Iron & Ink</span>
          <div className="flex gap-3">
            {["Instagram", "Email"].map((item) => (
              <span key={item} className="text-[8px]" style={{ color: "#bbb" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Immersive Dark ──────────────────────────────────────────────

function ImmersiveDarkPreview() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#050505", fontFamily: "'Inter', sans-serif", minHeight: 600 }}
    >
      {/* Full-bleed hero image with gradient and text overlay */}
      <div className="relative" style={{ height: 300 }}>
        <DarkImagePlaceholder
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0d0d0d 0%, #181818 40%, #0f0f0f 100%)",
          }}
        />
        {/* Bottom gradient fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 40%, #050505 100%)",
          }}
        />
        {/* Text at bottom-left */}
        <div className="absolute bottom-5 left-5 right-5">
          <h1
            className="text-[56px] leading-[0.9] mb-2"
            style={{ fontFamily: "'Abril Fatface', serif", color: "#ffffff" }}
          >
            Iron<br />& Ink
          </h1>
          <p className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Where art meets skin.
          </p>
          <span
            className="text-[9px] uppercase tracking-widest mb-4 block"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Portland, OR
          </span>
          <span
            className="inline-block text-[10px] font-medium uppercase tracking-wider px-5 py-2 rounded-full"
            style={{
              backgroundColor: "#ffffff",
              color: "#050505",
              boxShadow: "0 0 20px rgba(255,255,255,0.15)",
            }}
          >
            Book a Consultation
          </span>
        </div>
      </div>

      {/* 4-column masonry gallery */}
      <div className="px-4 pt-6 pb-4">
        <div className="grid grid-cols-4 gap-1.5" style={{ gridAutoRows: "1px" }}>
          {[140, 100, 120, 90, 90, 130, 100, 110].map((h, i) => (
            <DarkImagePlaceholder
              key={i}
              className="rounded-sm"
              style={{ gridRowEnd: `span ${Math.round(h / 10)}`, height: h }}
            />
          ))}
        </div>
      </div>

      {/* Minimal horizontal footer */}
      <div className="mx-4 mt-2 mb-4 py-3 px-4 rounded-sm" style={{ backgroundColor: "#0a0a0a", border: "1px solid #151515" }}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-[8px] uppercase tracking-widest block mb-1.5" style={{ color: "#444" }}>
              Location
            </span>
            <p className="text-[9px]" style={{ color: "#888" }}>
              742 SE Division St<br />Portland, OR 97202
            </p>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-widest block mb-1.5" style={{ color: "#444" }}>
              Hours
            </span>
            <p className="text-[9px]" style={{ color: "#888" }}>
              Mon–Sat: 11am–8pm<br />Sunday: Closed
            </p>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-widest block mb-1.5" style={{ color: "#444" }}>
              Contact
            </span>
            <p className="text-[9px]" style={{ color: "#888" }}>
              hello@ironandink.co<br />(503) 555-0142
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Warm Artisan ────────────────────────────────────────────────

function WarmArtisanPreview() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#F5F0EB", fontFamily: "'Inter', sans-serif", minHeight: 600 }}
    >
      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #e0dbd6" }}
      >
        <span
          className="text-[12px] font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", color: "#2a2520" }}
        >
          Iron & Ink
        </span>
        <div className="flex items-center gap-4">
          {["Portfolio", "Artists", "About"].map((item) => (
            <span key={item} className="text-[9px]" style={{ color: "#8a8078" }}>
              {item}
            </span>
          ))}
          <span
            className="text-[9px] font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: "#C1440E", color: "#fff" }}
          >
            Book Now
          </span>
        </div>
      </div>

      {/* Split hero */}
      <div className="flex" style={{ height: 220 }}>
        {/* Text side */}
        <div
          className="w-1/2 flex flex-col justify-center px-6"
          style={{ backgroundColor: "#EDE8E2" }}
        >
          <span className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#C1440E" }}>
            Portland, OR
          </span>
          <h1
            className="text-[32px] leading-[1.05] mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2a2520" }}
          >
            Iron & Ink<br />Studio
          </h1>
          <p className="text-[10px] mb-4" style={{ color: "#8a8078" }}>
            Crafted with care, worn forever.
          </p>
          <div>
            <span
              className="text-[9px] font-medium px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: "#C1440E", color: "#fff" }}
            >
              Book a Consultation
            </span>
          </div>
        </div>
        {/* Image side */}
        <WarmImagePlaceholder className="w-1/2" />
      </div>

      {/* Gallery section */}
      <div className="px-5 pt-6 pb-4">
        <span
          className="text-[10px] uppercase tracking-widest block mb-3"
          style={{ color: "#C1440E" }}
        >
          Our Work
        </span>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <WarmImagePlaceholder
              key={i}
              className="rounded-lg aspect-square"
            />
          ))}
        </div>
      </div>

      {/* Hours + Team cards */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: "#EDE8E2" }}>
          <span
            className="text-[9px] font-semibold uppercase tracking-wider block mb-2.5"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2a2520" }}
          >
            Studio Hours
          </span>
          <div className="space-y-1.5">
            {[
              ["Mon–Fri", "11am – 8pm"],
              ["Saturday", "10am – 6pm"],
              ["Sunday", "By appt."],
            ].map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="text-[8px]" style={{ color: "#8a8078" }}>{day}</span>
                <span className="text-[8px] font-medium" style={{ color: "#4a4540" }}>{hours}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: "#EDE8E2" }}>
          <span
            className="text-[9px] font-semibold uppercase tracking-wider block mb-2.5"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2a2520" }}
          >
            Our Artists
          </span>
          <div className="space-y-2">
            {[
              ["Marco Reyes", "Blackwork, Geometric"],
              ["Ava Chen", "Watercolor, Fine Line"],
              ["D. Kowalski", "Traditional, Neo-Trad"],
            ].map(([name, styles]) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#d8cfc5" }}
                />
                <div>
                  <span className="text-[8px] font-medium block" style={{ color: "#2a2520" }}>{name}</span>
                  <span className="text-[7px]" style={{ color: "#8a8078" }}>{styles}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid #e0dbd6" }}>
        <div className="flex justify-between items-center">
          <span className="text-[8px]" style={{ color: "#b0a89e" }}>© 2024 Iron & Ink</span>
          <span className="text-[8px]" style={{ color: "#b0a89e" }}>Portland, OR</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────

export function TemplatePreview({ template }: TemplatePreviewProps) {
  switch (template.slug) {
    case "bold-editorial":
      return <BoldEditorialPreview />;
    case "studio-minimal":
      // Absorbed clean-minimal in the 9→7 consolidation — inherits its preview.
      return <CleanMinimalPreview />;
    case "dark-cinematic":
      // Absorbed immersive-dark in the 9→7 consolidation — inherits its preview.
      return <ImmersiveDarkPreview />;
    case "warm-artisan":
      return <WarmArtisanPreview />;
    default:
      return null;
  }
}

TemplatePreview.displayName = "TemplatePreview";

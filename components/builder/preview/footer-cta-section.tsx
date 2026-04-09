"use client";

import { cn } from "@/lib/utils";
import { useBuilder } from "@/components/builder/builder-provider";
import type { CtaLayout, CtaStyle } from "@/lib/types/builder";
import { MOCK_STUDIO_DATA } from "@/lib/data/mock-studio";
import type { StudioData } from "@/lib/repositories";

interface VariantProps {
  glow: boolean;
  data: StudioData | null;
  ctaStyle: CtaStyle;
}

function ctaButtonProps(style: CtaStyle): { radiusClass: string; inlineStyle: React.CSSProperties } {
  return {
    radiusClass: style === "pill" ? "rounded-full" : "rounded-lg",
    inlineStyle:
      style === "outline"
        ? { background: "transparent", color: "var(--accent)", border: "2px solid var(--accent)" }
        : { backgroundColor: "var(--accent)", color: "var(--accent-text)" },
  };
}

/* ------------------------------------------------------------------ */
/*  Map Pin SVG icon (no emoji)                                       */
/* ------------------------------------------------------------------ */
function MapPinIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout: simple-minimal                                            */
/* ------------------------------------------------------------------ */
function SimpleMinimal({ glow, data, ctaStyle }: VariantProps) {
  const namePart = data?.name ? `VISIT ${data.name.toUpperCase()}?` : '';
  const addressParts = [
    data?.address,
    [data?.city, data?.state].filter(Boolean).join(', '),
  ].filter(Boolean);
  if (data?.services?.includes('walk-ins')) addressParts.push('Walk-ins Welcome');
  const bodyText = addressParts.join(' \u00B7 ');

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      {/* Glow: centered behind content */}
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-64 w-64 rounded-full opacity-40 blur-[100px]"
            style={{ backgroundColor: "var(--footer-glow)" }}
          />
        </div>
      )}

      <div className="mx-auto max-w-[1350px] px-6 py-20 @lg:px-10">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <h2
            className="text-3xl font-bold uppercase tracking-tight @lg:text-4xl"
            style={{
              fontFamily: "var(--heading-font)",
              color: "var(--text-primary)",
            }}
          >
            {namePart}
          </h2>
          {bodyText && (
            <p className="max-w-lg text-sm" style={{ color: "var(--text-muted)" }}>
              {bodyText}
            </p>
          )}
          <button
            className={cn("mt-2 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90", ctaButtonProps(ctaStyle).radiusClass)}
            style={ctaButtonProps(ctaStyle).inlineStyle}
          >
            Book an Appointment
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout: contact-form                                              */
/* ------------------------------------------------------------------ */
function ContactForm({ glow, data, ctaStyle }: VariantProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--bg-raised)" }}
    >
      {/* Glow: between the two columns, biased toward the form */}
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-end pr-[20%]"
          aria-hidden="true"
        >
          <div
            className="h-48 w-48 rounded-full opacity-25 blur-[100px]"
            style={{ backgroundColor: "var(--footer-glow)" }}
          />
        </div>
      )}

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-8 px-8 py-16 @md:grid-cols-2 @lg:px-12">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <h2
            className="text-2xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "var(--heading-font)",
              color: "var(--text-primary)",
            }}
          >
            Get in Touch
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Have a question about a custom piece? Send us a message and we&apos;ll
            get back to you within 24 hours.
          </p>
          <div className="mt-auto flex flex-col gap-2">
            {data?.phone && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {data.phone}
              </span>
            )}
            {data?.email && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {data.email}
              </span>
            )}
          </div>
        </div>

        {/* Right column — mock form */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              readOnly
              className="rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontFamily: "var(--body-font)",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              readOnly
              className="rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontFamily: "var(--body-font)",
              }}
            />
          </div>
          <textarea
            placeholder="Message"
            rows={3}
            readOnly
            className="resize-none rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:outline-none"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontFamily: "var(--body-font)",
            }}
          />
          <button
            className={cn("w-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90", ctaButtonProps(ctaStyle).radiusClass)}
            style={ctaButtonProps(ctaStyle).inlineStyle}
          >
            Send Message
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout: map-info                                                  */
/* ------------------------------------------------------------------ */
function MapInfo({ glow, data, ctaStyle }: VariantProps) {
  const cityStateZip = [data?.city, data?.state, data?.zipCode].filter(Boolean).join(', ');
  return (
    <section className="relative w-full overflow-hidden">
      <div className="grid grid-cols-1 @md:grid-cols-[1.2fr_1fr]">
        {/* Map placeholder */}
        <div
          className="flex min-h-[320px] flex-col items-center justify-center"
          style={{
            backgroundColor: "var(--bg-sunken)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <MapPinIcon className="mb-2" style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Map
          </span>
        </div>

        {/* Info panel */}
        <div className="relative p-8 @lg:p-10" style={{ backgroundColor: "var(--bg-raised)" }}>
          {/* Glow: peeks into right column from behind the map edge */}
          {glow && (
            <div
              className="pointer-events-none absolute inset-y-0 -left-24 flex w-48 items-center"
              aria-hidden="true"
            >
              <div
                className="h-48 w-48 rounded-full opacity-30 blur-[80px]"
                style={{ backgroundColor: "var(--footer-glow)" }}
              />
            </div>
          )}
          <h2
            className="text-xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "var(--heading-font)",
              color: "var(--text-primary)",
            }}
          >
            Find Us
          </h2>

          <div className="mt-5 flex flex-col gap-1">
            {data?.address && (
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {data.address}
              </span>
            )}
            {cityStateZip && (
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {cityStateZip}
              </span>
            )}
          </div>

          <div className="my-5 h-px" style={{ backgroundColor: "var(--border)" }} />

          <div className="flex flex-col gap-1">
            {data?.phone && (
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {data.phone}
              </span>
            )}
            {data?.email && (
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {data.email}
              </span>
            )}
          </div>

          <div className="my-5 h-px" style={{ backgroundColor: "var(--border)" }} />

          <div className="flex flex-col gap-1">
            {["Monday", "Friday", "Saturday", "Sunday"].map((day) => {
              const h = data?.hours?.[day];
              if (!h) return null;
              const label = h.closed ? "Closed" : `${h.open} \u2013 ${h.close}`;
              return (
                <span key={day} className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {day}: {label}
                </span>
              );
            })}
          </div>

          <button
            className={cn("mt-6 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90", ctaButtonProps(ctaStyle).radiusClass)}
            style={ctaButtonProps(ctaStyle).inlineStyle}
          >
            Get Directions
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout: booking                                                   */
/* ------------------------------------------------------------------ */
function Booking({ glow, data: _data, ctaStyle }: VariantProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="grid grid-cols-1 @md:grid-cols-[1fr_1.1fr]"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        {/* Left — headline + CTA */}
        <div className="relative flex flex-col justify-center px-8 py-16 @lg:px-12 @lg:py-20">
          {/* Glow: bleeds from left edge behind headline */}
          {glow && (
            <div
              className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full opacity-30 blur-[80px]"
              aria-hidden="true"
              style={{ backgroundColor: "var(--footer-glow)" }}
            />
          )}

          <div className="relative">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              Now Booking
            </p>
            <h2
              className="mt-3 text-3xl font-bold uppercase tracking-tight @lg:text-4xl"
              style={{
                fontFamily: "var(--heading-font)",
                color: "var(--text-primary)",
              }}
            >
              Ready for Your
              <br />
              Next Piece?
            </h2>
            <p
              className="mt-4 max-w-sm text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Custom tattoo art, crafted for you. Book a free consultation and
              let&apos;s bring your vision to life.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                className={cn("px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90", ctaButtonProps(ctaStyle).radiusClass)}
                style={ctaButtonProps(ctaStyle).inlineStyle}
              >
                Book a Consultation
              </button>
              <button
                className="rounded-lg px-6 py-3.5 text-sm font-semibold transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
              >
                View Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Right — trust signals panel */}
        <div
          className="flex flex-col justify-center border-t px-6 py-10 @md:border-t-0 @md:border-l @md:px-8 @md:py-16 @lg:px-12 @lg:py-20"
          style={{
            backgroundColor: "var(--bg-raised)",
            borderColor: "var(--border)",
          }}
        >
          <div className="grid grid-cols-2 gap-5">
            {[
              { number: "4.9", label: "Average Rating", sub: "from 80+ reviews" },
              { number: "127+", label: "Happy Clients", sub: "and counting" },
              { number: "3", label: "Expert Artists", sub: "specialized styles" },
              { number: "~2 wk", label: "Avg Wait Time", sub: "for new bookings" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-xl p-4"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--heading-font)",
                    color: "var(--text-primary)",
                  }}
                >
                  {stat.number}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {stat.label}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-6 h-px w-full"
            style={{ backgroundColor: "var(--border)" }}
          />

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex shrink-0 -space-x-2">
              {[
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/68.jpg",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                  style={{ border: "2px solid var(--bg-raised)" }}
                />
              ))}
            </div>
            <p className="min-w-0 text-xs" style={{ color: "var(--text-muted)" }}>
              Join 127+ satisfied clients who trusted us with their ink
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant map                                                       */
/* ------------------------------------------------------------------ */
const VARIANTS: Record<CtaLayout, React.FC<VariantProps>> = {
  "simple-minimal": SimpleMinimal,
  "contact-form": ContactForm,
  "map-info": MapInfo,
  booking: Booking,
};

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                  */
/* ------------------------------------------------------------------ */
export function FooterCTASection({ className }: { className?: string }) {
  const { config, studio, useMockData } = useBuilder();
  const data = useMockData ? MOCK_STUDIO_DATA : studio;
  const layout: CtaLayout = config.ctaLayout ?? "simple-minimal";
  const Variant = VARIANTS[layout] ?? VARIANTS["simple-minimal"];
  const glow = config.glowIntensity !== undefined && config.glowIntensity !== "none";
  const ctaStyle: CtaStyle = config.ctaStyle ?? "filled";

  return (
    <div className={cn("transition-all duration-500 ease-in-out", className)}>
      <Variant glow={glow} data={data} ctaStyle={ctaStyle} />
    </div>
  );
}

FooterCTASection.displayName = "FooterCTASection";

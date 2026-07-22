import type { ReactNode } from "react";

const GLYPHS = {
  check: { d: "M4 10.5l4 4 8-9", strokeWidth: "2" },
  "sign-in": { d: "M12 3.5h4v13h-4M3.5 10H12M8.5 6.5L12 10l-3.5 3.5", strokeWidth: "1.5" },
} as const;

interface FlowHeaderProps {
  icon: keyof typeof GLYPHS;
  eyebrow?: string;
  title: string;
  /** Supporting copy rendered below the coin-and-title row. */
  children?: ReactNode;
}

/** Coin-and-title header for booking flow moments: gates, confirmations. */
export function FlowHeader({ icon, eyebrow, title, children }: FlowHeaderProps) {
  const glyph = GLYPHS[icon];
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink-rust/30 bg-ink-rust/[0.06]">
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5 text-ink-rust"
            fill="none"
            stroke="currentColor"
            strokeWidth={glyph.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={glyph.d} />
          </svg>
        </div>
        <div>
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-rust">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`${eyebrow ? "mt-0.5 " : ""}text-xl font-medium tracking-tight text-ink-black dark:text-ink-cream`}
          >
            {title}
          </h2>
        </div>
      </div>
      {children ? (
        <p className="mt-3 text-[13px] text-ink-black/60 dark:text-ink-cream/60">{children}</p>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavPill } from "@/components/ui/nav-pill";
import { Divider } from "@/components/ui/divider";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
];

export function Navigation() {
  const pathname = usePathname();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo pill */}
          <Link href="/" className="flex items-center">
            <NavPill variant={mode} className="h-10 flex items-center px-5 rounded-full">
              <Logo size="md" variant={isDark ? "light" : "dark"} />
            </NavPill>
          </Link>

          {/* Nav links pill — desktop */}
          <NavPill variant={mode} className="hidden md:flex h-10 items-center gap-1 px-[var(--pill-inset)] rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.15em] uppercase font-medium transition-colors",
                  pathname === link.href
                    ? isDark
                      ? "bg-ink-cream/[0.06] text-ink-cream font-semibold"
                      : "bg-ink-black/[0.06] text-ink-black font-semibold"
                    : isDark
                      ? "text-ink-cream/35 hover:text-ink-cream/60"
                      : "text-ink-black/35 hover:text-ink-black/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </NavPill>

          {/* Auth pill — desktop */}
          <NavPill variant={mode} className="hidden md:flex h-10 items-center gap-2.5 pl-4 pr-[var(--pill-inset)] rounded-full">
            <Link
              href="/login"
              className={cn(
                "font-mono text-[10px] tracking-[0.15em] uppercase font-medium transition-colors",
                isDark
                  ? "text-ink-cream/35 hover:text-ink-cream/60"
                  : "text-ink-black/35 hover:text-ink-black/60"
              )}
            >
              Sign In
            </Link>
            <Button
              as={Link}
              href="/signup"
              variant="ink"
              size="sm"
              statusDot="w-[5px] h-[5px]"
              className="h-auto px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] text-[10px] font-semibold gap-1.5"
            >
              Get Started
            </Button>
          </NavPill>

          {/* Mobile Menu Button */}
          <NavPill variant={mode} className="md:hidden p-0.5 rounded-full">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "p-2.5 rounded-full transition-colors",
                isDark
                  ? "text-ink-cream/60 hover:bg-ink-cream/[0.04]"
                  : "text-ink-black/60 hover:bg-ink-black/[0.04]"
              )}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </NavPill>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-[400px] opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <NavPill variant={mode} className="p-4 rounded-2xl">
            {/* Nav Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase font-medium transition-colors",
                    pathname === link.href
                      ? isDark
                        ? "bg-ink-cream/[0.06] text-ink-cream font-semibold"
                        : "bg-ink-black/[0.06] text-ink-black font-semibold"
                      : isDark
                        ? "text-ink-cream/35 hover:bg-ink-cream/[0.04] hover:text-ink-cream/60"
                        : "text-ink-black/35 hover:bg-ink-black/[0.04] hover:text-ink-black/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Divider variant={mode} className="mb-4" />

            {/* Auth Buttons */}
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors",
                  isDark
                    ? "text-ink-cream/35 hover:text-ink-cream/60 hover:bg-ink-cream/[0.04]"
                    : "text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04]"
                )}
              >
                Sign In
              </Link>
              <Button
                as={Link}
                href="/signup"
                variant="ink"
                size="md"
                statusDot="w-[5px] h-[5px]"
                className="w-full rounded-xl font-semibold"
              >
                Get Started
              </Button>
            </div>
          </NavPill>
        </div>
      </div>
    </nav>
  );
}

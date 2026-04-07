"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavPill } from "@/components/ui/nav-pill";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
];

/** @deprecated Use Navigation from navigation.tsx (Mono Pills) instead */
export function NavigationDeprecated() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <NavPill className="px-3 py-1.5">
              <Logo size="md" variant="dark" />
            </NavPill>
          </Link>

          {/* Navigation Links — desktop */}
          <NavPill className="hidden md:flex items-center space-x-1 p-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-ink-black/[0.06] text-ink-black"
                    : "text-ink-black/45 hover:bg-ink-black/[0.04] hover:text-ink-black/70"
                )}
              >
                {link.label}
              </Link>
            ))}
          </NavPill>

          {/* Auth Buttons — desktop */}
          <NavPill className="hidden md:flex items-center space-x-3 p-1">
            <Button variant="ghost" size="sm" className="text-ink-black/45 hover:text-ink-black/70 hover:bg-ink-black/[0.04]">
              Sign In
            </Button>
            <Button size="sm" className="bg-ink-black text-ink-cream hover:bg-ink-black/90 border-none">Get Started</Button>
          </NavPill>

          {/* Mobile Menu Button */}
          <NavPill
            className="md:hidden p-0.5 cursor-pointer"
          >
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-ink-black/60 hover:bg-ink-black/[0.04] transition-colors"
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
          <NavPill className="p-4 rounded-2xl">
            {/* Nav Links */}
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-ink-black/[0.06] text-ink-black"
                      : "text-ink-black/45 hover:bg-ink-black/[0.04] hover:text-ink-black/70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Hairline divider */}
            <div className="h-px bg-ink-black/[0.06] mb-4" />

            {/* Auth Buttons */}
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="md" className="w-full justify-center rounded-xl text-ink-black/45 hover:text-ink-black/70 hover:bg-ink-black/[0.04]">
                Sign In
              </Button>
              <Button size="md" className="w-full justify-center rounded-xl bg-ink-black text-ink-cream hover:bg-ink-black/90 border-none">
                Get Started
              </Button>
            </div>
          </NavPill>
        </div>
      </div>
    </nav>
  );
}

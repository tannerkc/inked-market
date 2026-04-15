"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
];

export function NavigationSplitPills() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left pill: Logo + Nav */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-full border border-ink-black/[0.06] bg-ink-cream/90 backdrop-blur supports-[backdrop-filter]:bg-ink-cream/70">
            <Link href="/" className="flex items-center">
              <Logo size="md" variant="dark" />
            </Link>
            <div className="hidden md:block w-px h-4 bg-ink-black/[0.08]" />
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    pathname === link.href
                      ? "bg-ink-black/[0.06] text-ink-black"
                      : "text-ink-black/40 hover:text-ink-black/65"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right pill: Auth */}
          <div className="flex items-center gap-2 px-2 py-2 pl-4 rounded-full border border-ink-black/[0.06] bg-ink-cream/90 backdrop-blur supports-[backdrop-filter]:bg-ink-cream/70">
            <span className="hidden sm:inline text-xs font-medium text-ink-black/40 hover:text-ink-black/65 cursor-pointer transition-colors">
              Sign In
            </span>
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ink-black text-ink-cream text-xs font-semibold transition-colors hover:bg-ink-black/90"
            >
              <span className="w-[5px] h-[5px] rounded-full bg-ink-red shadow-[0_0_6px_color-mix(in_srgb,var(--ink-red)_40%,transparent)]" />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-ink-black/60 hover:bg-ink-black/[0.04]"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

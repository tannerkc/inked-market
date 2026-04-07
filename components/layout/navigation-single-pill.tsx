"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
];

export function NavigationSinglePill() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-2xl px-4 py-2 rounded-full border border-ink-black/[0.06] bg-ink-cream/90 backdrop-blur supports-[backdrop-filter]:bg-ink-cream/70">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo size="md" variant="dark" />
            </Link>

            {/* Nav Links */}
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

            {/* Auth */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-medium text-ink-black/40 hover:text-ink-black/65 cursor-pointer transition-colors">
                Sign In
              </span>
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ink-black text-ink-cream text-xs font-semibold transition-colors hover:bg-ink-black/90"
              >
                <span className="w-[5px] h-[5px] rounded-full bg-ink-red shadow-[0_0_6px_rgba(255,51,51,0.4)]" />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavPill } from "@/components/ui/nav-pill";
import { Divider } from "@/components/ui/divider";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/lineup", label: "Line Up" },
  { href: "/saved", label: "Activity" },
];

export function Navigation() {
  const pathname = usePathname();
  const { mode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const isDark = mode === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.role === "studio" ? (user.studioName || user.name) : user?.name;
  const dashboardHref = user?.role ? "/dashboard" : "/";
  const roleLabel = user?.role === "studio" ? "Studio" : user?.role === "artist" ? "Artist" : "Customer";
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    window.location.href = "/";
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Hide navigation on full-screen builder page
  if (pathname.startsWith("/dashboard/builder")) return null;

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo pill */}
          <Link href={isAuthenticated ? "/discover" : "/"} className="flex items-center">
            <NavPill variant={mode} className="h-10 flex items-center px-4 rounded-full overflow-hidden">
              <Logo size="md" variant={isDark ? "light" : "dark"} />
            </NavPill>
          </Link>

          {/* Nav links pill — desktop, only visible when authenticated */}
          {isAuthenticated && <NavPill variant={mode} className="hidden md:flex h-10 items-center gap-1 px-[var(--pill-inset)] rounded-full">
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
          </NavPill>}

          {/* Auth pill — desktop */}
          {isAuthenticated && user ? (
            <div ref={menuRef} className="hidden md:block relative">
              <NavPill
                variant={mode}
                className="h-10 flex items-center gap-2 pl-1.5 pr-3 rounded-full cursor-pointer"
              >
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  {/* Circle avatar with initials + status dot */}
                  <div className="relative">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] font-semibold",
                      isDark
                        ? "bg-ink-cream/[0.06] border border-ink-cream/[0.1] text-ink-cream/50"
                        : "bg-ink-black/[0.06] border border-ink-black/[0.1] text-ink-black/50"
                    )}>
                      {initials}
                    </div>
                    <div className="absolute -top-px -right-px w-[7px] h-[7px] rounded-full bg-ink-sage border-[1.5px] border-ink-black" style={{ borderColor: isDark ? '#0A0A0A' : '#F5F0EB' }} />
                  </div>
                  {/* Name */}
                  <span className={cn(
                    "font-mono text-[10px] tracking-[0.1em] truncate max-w-[120px]",
                    isDark ? "text-ink-cream/50" : "text-ink-black/50"
                  )}>
                    {displayName}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      menuOpen && "rotate-180",
                      isDark ? "text-ink-cream/20" : "text-ink-black/20"
                    )}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </NavPill>

              {/* Dropdown menu */}
              <div className={cn(
                "absolute top-[calc(100%+8px)] right-0 min-w-[200px] rounded-2xl border overflow-hidden transition-all duration-200",
                isDark
                  ? "bg-ink-black/95 border-ink-cream/[0.06] backdrop-blur-xl"
                  : "bg-ink-cream/97 border-ink-black/[0.06] backdrop-blur-xl",
                menuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              )}>
                {/* Header card */}
                <div className={cn(
                  "flex items-center gap-2.5 px-4 py-3 border-b",
                  isDark ? "border-ink-cream/[0.04]" : "border-ink-black/[0.04]"
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold shrink-0",
                    isDark
                      ? "bg-ink-cream/[0.06] border border-ink-cream/[0.1] text-ink-cream/50"
                      : "bg-ink-black/[0.06] border border-ink-black/[0.1] text-ink-black/50"
                  )}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[12px] font-medium truncate", isDark ? "text-ink-cream/70" : "text-ink-black/70")}>
                      {displayName}
                    </p>
                    <p className={cn("font-mono text-[9px] tracking-[0.1em] uppercase", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                      {roleLabel}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 transition-colors",
                      isDark ? "hover:bg-ink-cream/[0.04]" : "hover:bg-ink-black/[0.04]"
                    )}
                  >
                    <svg className={cn("w-4 h-4", isDark ? "text-ink-cream/30" : "text-ink-black/30")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                    <span className={cn("font-mono text-[10px] tracking-[0.12em] uppercase", isDark ? "text-ink-cream/50" : "text-ink-black/50")}>
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 transition-colors",
                      isDark ? "hover:bg-ink-cream/[0.04]" : "hover:bg-ink-black/[0.04]"
                    )}
                  >
                    <svg className={cn("w-4 h-4", isDark ? "text-ink-cream/30" : "text-ink-black/30")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    <span className={cn("font-mono text-[10px] tracking-[0.12em] uppercase", isDark ? "text-ink-cream/50" : "text-ink-black/50")}>
                      Settings
                    </span>
                  </Link>
                </div>

                <div className={cn("h-px mx-4", isDark ? "bg-ink-cream/[0.04]" : "bg-ink-black/[0.04]")} />

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 w-full transition-colors cursor-pointer",
                      isDark ? "hover:bg-ink-cream/[0.04]" : "hover:bg-ink-black/[0.04]"
                    )}
                  >
                    <svg className={cn("w-4 h-4", isDark ? "text-ink-cream/20" : "text-ink-black/20")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className={cn("font-mono text-[10px] tracking-[0.12em] uppercase", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                      Log Out
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
          )}

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
            {/* Nav Links — only when authenticated */}
            {isAuthenticated && (
              <>
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
              </>
            )}

            {/* Auth Buttons */}
            <div className="flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* User info row */}
                  <div className="flex items-center gap-2.5 px-4 py-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold shrink-0",
                      isDark
                        ? "bg-ink-cream/[0.06] border border-ink-cream/[0.1] text-ink-cream/50"
                        : "bg-ink-black/[0.06] border border-ink-black/[0.1] text-ink-black/50"
                    )}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-[12px] font-medium truncate", isDark ? "text-ink-cream/60" : "text-ink-black/60")}>
                        {displayName}
                      </p>
                      <p className={cn("font-mono text-[8px] tracking-[0.1em] uppercase", isDark ? "text-ink-cream/25" : "text-ink-black/25")}>
                        {roleLabel}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors",
                      isDark
                        ? "text-ink-cream/35 hover:text-ink-cream/60 hover:bg-ink-cream/[0.04]"
                        : "text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04]"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors",
                      isDark
                        ? "text-ink-cream/35 hover:text-ink-cream/60 hover:bg-ink-cream/[0.04]"
                        : "text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04]"
                    )}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className={cn(
                      "w-full text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors cursor-pointer",
                      isDark
                        ? "text-ink-cream/25 hover:text-ink-cream/50 hover:bg-ink-cream/[0.04]"
                        : "text-ink-black/25 hover:text-ink-black/50 hover:bg-ink-black/[0.04]"
                    )}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </NavPill>
        </div>
      </div>
    </nav>
  );
}

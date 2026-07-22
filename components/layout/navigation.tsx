"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { NavPill } from "@/components/ui/nav-pill";
import { Divider } from "@/components/ui/divider";
import { useAuth } from "@/components/providers/auth-provider";
import { NotificationsBell } from "@/components/booking";
import { MessagesNavButton } from "@/components/messages";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/lineup", label: "Line Up" },
  { href: "/saved", label: "Activity" },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, effectiveRole, viewMode, setViewMode } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = effectiveRole === "studio" ? (user?.studioName || user?.name) : user?.name;
  const dashboardHref = user?.role ? "/dashboard" : "/";
  const roleLabel =
    effectiveRole === "studio" ? "Studio"
    : effectiveRole === "artist" ? "Artist"
    : user && user.role !== "customer" ? "Customer Mode"
    : "Customer";
  const avatarName = displayName || "?";

  // Pros can browse as a customer; real customers never see the toggle.
  const canSwitchMode = !!user && user.role !== "customer";
  const modeSwitchLabel = viewMode === "customer"
    ? `Back to ${user?.role === "studio" ? "Studio" : "Artist"}`
    : "Customer Mode";

  const handleModeSwitch = () => {
    setViewMode(viewMode === "customer" ? "professional" : "customer");
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/dashboard");
  };

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

  // Hide navigation on full-screen builder + standalone public studio sites
  if (
    pathname.startsWith("/dashboard/builder") ||
    pathname.startsWith("/studios/")
  )
    return null;

  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo pill */}
          <Link href={isAuthenticated ? "/discover" : "/"} className="flex items-center">
            <NavPill className="h-10 flex items-center px-4 rounded-full overflow-hidden">
              <Logo size="md" />
            </NavPill>
          </Link>

          {/* Nav links pill — desktop, only visible when authenticated */}
          {isAuthenticated && <NavPill className="hidden md:flex h-10 items-center gap-1 px-[var(--pill-inset)] rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-[var(--pill-btn-px)] py-[var(--pill-btn-py)] rounded-full font-mono text-[10px] tracking-[0.15em] uppercase font-medium transition-colors",
                  pathname === link.href
                    ? "bg-ink-black/[0.06] text-ink-black font-semibold dark:bg-ink-cream/[0.06] dark:text-ink-cream"
                    : "text-ink-black/35 hover:text-ink-black/60 dark:text-ink-cream/35 dark:hover:text-ink-cream/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </NavPill>}

          {/* Auth pill — desktop */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2">
              <MessagesNavButton />
              <NotificationsBell />
              <div ref={menuRef} className="relative">
              <NavPill className="h-10 flex items-center gap-2 pl-1.5 pr-3 rounded-full cursor-pointer">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  {/* Circle avatar with initials + status dot */}
                  <div className="relative">
                    <InitialsAvatar name={avatarName} tone="strong" />
                    {/* Status dot — border matches the NavPill bg (cream in light, ink-black in dark) */}
                    <div className="absolute -top-px -right-px w-[7px] h-[7px] rounded-full bg-ink-sage border-[1.5px] border-ink-cream dark:border-ink-black" />
                  </div>
                  {/* Name */}
                  <span className="font-mono text-[10px] tracking-[0.1em] truncate max-w-[120px] text-ink-black/50 dark:text-ink-cream/50">
                    {displayName}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200 text-ink-black/20 dark:text-ink-cream/20",
                      menuOpen && "rotate-180"
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
                "bg-ink-cream/97 border-ink-black/[0.06] backdrop-blur-xl",
                "dark:bg-ink-black/95 dark:border-ink-cream/[0.06]",
                menuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              )}>
                {/* Header card */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-ink-black/[0.04] dark:border-ink-cream/[0.04]">
                  <InitialsAvatar name={avatarName} tone="strong" className="h-9 w-9 text-[11px]" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium truncate text-ink-black/70 dark:text-ink-cream/70">
                      {displayName}
                    </p>
                    <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink-black/25 dark:text-ink-cream/25">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-ink-black/[0.04] dark:hover:bg-ink-cream/[0.04]"
                  >
                    <svg className="w-4 h-4 text-ink-black/30 dark:text-ink-cream/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-black/50 dark:text-ink-cream/50">
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-ink-black/[0.04] dark:hover:bg-ink-cream/[0.04]"
                  >
                    <svg className="w-4 h-4 text-ink-black/30 dark:text-ink-cream/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-black/50 dark:text-ink-cream/50">
                      Settings
                    </span>
                  </Link>
                  {canSwitchMode ? (
                    <button
                      onClick={handleModeSwitch}
                      className="flex items-center gap-2.5 px-4 py-2.5 w-full transition-colors cursor-pointer hover:bg-ink-black/[0.04] dark:hover:bg-ink-cream/[0.04]"
                    >
                      <svg className="w-4 h-4 text-ink-black/30 dark:text-ink-cream/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                      </svg>
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-black/50 dark:text-ink-cream/50">
                        {modeSwitchLabel}
                      </span>
                    </button>
                  ) : null}
                </div>

                <div className="h-px mx-4 bg-ink-black/[0.04] dark:bg-ink-cream/[0.04]" />

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 w-full transition-colors cursor-pointer hover:bg-ink-black/[0.04] dark:hover:bg-ink-cream/[0.04]"
                  >
                    <svg className="w-4 h-4 text-ink-black/20 dark:text-ink-cream/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-black/25 dark:text-ink-cream/25">
                      Log Out
                    </span>
                  </button>
                </div>
              </div>
              </div>
            </div>
          ) : (
            <NavPill className="hidden md:flex h-10 items-center gap-2.5 pl-4 pr-[var(--pill-inset)] rounded-full">
              <Link
                href="/login"
                className="font-mono text-[10px] tracking-[0.15em] uppercase font-medium transition-colors text-ink-black/35 hover:text-ink-black/60 dark:text-ink-cream/35 dark:hover:text-ink-cream/60"
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

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <MessagesNavButton />
                <NotificationsBell />
              </>
            ) : null}
          <NavPill className="p-0.5 rounded-full">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-full transition-colors text-ink-black/60 hover:bg-ink-black/[0.04] dark:text-ink-cream/60 dark:hover:bg-ink-cream/[0.04]"
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
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-[400px] opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <NavPill className="p-4 rounded-2xl">
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
                          ? "bg-ink-black/[0.06] text-ink-black font-semibold dark:bg-ink-cream/[0.06] dark:text-ink-cream"
                          : "text-ink-black/35 hover:bg-ink-black/[0.04] hover:text-ink-black/60 dark:text-ink-cream/35 dark:hover:bg-ink-cream/[0.04] dark:hover:text-ink-cream/60"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Divider className="mb-4" />
              </>
            )}

            {/* Auth Buttons */}
            <div className="flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* User info row */}
                  <div className="flex items-center gap-2.5 px-4 py-2">
                    <InitialsAvatar name={avatarName} tone="strong" size="md" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium truncate text-ink-black/60 dark:text-ink-cream/60">
                        {displayName}
                      </p>
                      <p className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink-black/25 dark:text-ink-cream/25">
                        {roleLabel}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04] dark:text-ink-cream/35 dark:hover:text-ink-cream/60 dark:hover:bg-ink-cream/[0.04]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04] dark:text-ink-cream/35 dark:hover:text-ink-cream/60 dark:hover:bg-ink-cream/[0.04]"
                  >
                    Settings
                  </Link>
                  {canSwitchMode ? (
                    <button
                      onClick={handleModeSwitch}
                      className="w-full text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors cursor-pointer text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04] dark:text-ink-cream/35 dark:hover:text-ink-cream/60 dark:hover:bg-ink-cream/[0.04]"
                    >
                      {modeSwitchLabel}
                    </button>
                  ) : null}
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors cursor-pointer text-ink-black/25 hover:text-ink-black/50 hover:bg-ink-black/[0.04] dark:text-ink-cream/25 dark:hover:text-ink-cream/50 dark:hover:bg-ink-cream/[0.04]"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full block text-center py-3 rounded-xl font-mono text-xs tracking-[0.15em] uppercase transition-colors text-ink-black/35 hover:text-ink-black/60 hover:bg-ink-black/[0.04] dark:text-ink-cream/35 dark:hover:text-ink-cream/60 dark:hover:bg-ink-cream/[0.04]"
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
